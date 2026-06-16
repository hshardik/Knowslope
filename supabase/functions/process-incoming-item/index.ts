import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Call the analyze-slack-thread function
async function analyzeSlackThread(slackUrl: string, notes?: string): Promise<any> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_PUBLISHABLE_KEY = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  
  console.log(`Calling analyze-slack-thread for URL: ${slackUrl}`);
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-slack-thread`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slackUrl, notes }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('analyze-slack-thread error:', response.status, errorText);
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Analysis failed');
  }
  
  return result.data;
}

// Build structured document content from analysis
function buildDocumentContent(analysis: any, slackUrl: string): any {
  const sections = analysis.sections || {};
  
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Summary' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: analysis.summary || 'No summary available.' }]
      },
      ...(sections.userProblem ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'User Problem' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.userProblem }]
        }
      ] : []),
      ...(sections.currentBehavior ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Current Behavior' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.currentBehavior }]
        }
      ] : []),
      ...(sections.expectedBehavior ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Expected Behavior' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.expectedBehavior }]
        }
      ] : []),
      ...(sections.stepsToReproduce ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Steps to Reproduce' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.stepsToReproduce }]
        }
      ] : []),
      ...(sections.knownLimitations ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Known Limitations' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.knownLimitations }]
        }
      ] : []),
      ...(sections.customerQuotes ? [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Customer Quotes' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: sections.customerQuotes }]
        }
      ] : []),
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Source' }]
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'From Slack: ' },
          { 
            type: 'text', 
            marks: [{ type: 'link', attrs: { href: slackUrl } }],
            text: 'View Original Thread'
          }
        ]
      }
    ]
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  try {
    const { incomingItemId, action, docType, category, userId, existingDocumentId } = await req.json();
    
    console.log('Processing incoming item:', { incomingItemId, action, docType, category, userId, existingDocumentId });

    if (!incomingItemId || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields: incomingItemId and action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get the incoming item
    const { data: item, error: itemError } = await supabase
      .from('slack_incoming_items')
      .select('*')
      .eq('id', incomingItemId)
      .single();

    if (itemError || !item) {
      console.error('Failed to get incoming item:', itemError);
      return new Response(JSON.stringify({ error: 'Incoming item not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update status to processing
    await supabase
      .from('slack_incoming_items')
      .update({ status: 'processing' })
      .eq('id', incomingItemId);

    const slackUrl = item.slack_url;

    // Determine document type and category based on action
    let finalDocType = docType || 'how_to';
    let finalCategory = category || 'product';

    switch (action) {
      case 'create_doc':
        finalDocType = docType || 'how_to';
        finalCategory = category || 'product';
        break;
      case 'log_bug':
        finalDocType = 'bug';
        finalCategory = 'support';
        break;
      case 'create_how_to':
        finalDocType = 'how_to';
        finalCategory = 'product';
        break;
      case 'log_feature':
        finalDocType = 'feature';
        finalCategory = 'product';
        break;
      case 'update_doc':
        // For updating existing docs, we'll use the existing doc's type/category
        break;
      default:
        finalDocType = 'how_to';
        finalCategory = 'product';
    }

    // Run AI analysis
    let title = 'Document from Slack';
    let analysis: any = null;
    let documentContent: any = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: item.message_preview || 'Content from Slack thread' }]
        }
      ]
    };
    let tags: string[] = [];
    let summary = '';

    try {
      analysis = await analyzeSlackThread(slackUrl, item.notes);
      console.log('AI analysis response:', JSON.stringify(analysis, null, 2));
      if (analysis) {
        title = analysis.title || title;
        summary = analysis.summary || '';
        tags = analysis.tags || [];
        documentContent = buildDocumentContent(analysis, slackUrl);
        console.log('AI analysis successful:', title);
        console.log('Sections found:', Object.keys(analysis.sections || {}));
        console.log('Document content sections:', JSON.stringify(documentContent.content.length, null, 2));
      }
    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      // Continue with basic document
    }

    let documentId: string;

    if (action === 'update_doc' && existingDocumentId) {
      // Update existing document with new content from Slack
      const { data: existingDoc, error: docFetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', existingDocumentId)
        .single();

      if (docFetchError || !existingDoc) {
        console.error('Failed to fetch existing document:', docFetchError);
        await supabase
          .from('slack_incoming_items')
          .update({ status: 'failed' })
          .eq('id', incomingItemId);

        return new Response(JSON.stringify({ error: 'Existing document not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Merge content - append new content to existing
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: documentContent,
          summary: summary || existingDoc.summary,
          slack_url: slackUrl,
          slack_channel_id: item.slack_channel_id,
          slack_channel_name: item.slack_channel_name,
          slack_message_ts: item.slack_message_ts,
          slack_thread_id: item.slack_thread_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDocumentId);

      if (updateError) {
        console.error('Failed to update document:', updateError);
        await supabase
          .from('slack_incoming_items')
          .update({ status: 'failed' })
          .eq('id', incomingItemId);

        return new Response(JSON.stringify({ error: 'Failed to update document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      documentId = existingDocumentId;
      console.log('Updated existing document:', documentId);

    } else {
      // Create new document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          title,
          summary,
          content: documentContent,
          category: finalCategory,
          type: finalDocType,
          tags,
          status: 'draft',
          visibility: 'team',
          created_from_slack: true,
          slack_thread_id: item.slack_thread_id,
          slack_channel_id: item.slack_channel_id,
          slack_channel_name: item.slack_channel_name,
          slack_message_ts: item.slack_message_ts,
          slack_url: slackUrl,
          creator_id: userId || null,
        })
        .select()
        .single();

      if (docError) {
        console.error('Failed to create document:', docError);
        await supabase
          .from('slack_incoming_items')
          .update({ status: 'failed' })
          .eq('id', incomingItemId);

        return new Response(JSON.stringify({ error: 'Failed to create document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      documentId = doc.id;
      console.log('Created new document:', documentId);
    }

    // Mark incoming item as completed
    await supabase
      .from('slack_incoming_items')
      .update({ 
        status: 'completed',
        processed_document_id: documentId
      })
      .eq('id', incomingItemId);

    // Create notifications for admins
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (admins?.length) {
      const notifications = admins.map((admin: { user_id: string }) => ({
        document_id: documentId,
        user_id: admin.user_id,
        notification_type: 'new_draft_from_slack',
        read: false,
      }));

      await supabase.from('slack_document_notifications').insert(notifications);
    }

    const typeLabels: Record<string, string> = {
      bug: 'Bug Report',
      how_to: 'How-To Guide',
      feature: 'Feature Request',
      troubleshooting: 'Troubleshooting',
      faq: 'FAQ',
      policy: 'Policy',
    };

    return new Response(JSON.stringify({
      success: true,
      documentId,
      title,
      action,
      docType: finalDocType,
      message: action === 'update_doc' 
        ? `Document updated successfully` 
        : `${typeLabels[finalDocType] || 'Document'} created: "${title}"`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Processing error:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
