
import { supabase } from './supabase';
import { stopCampaign, startCampaign, setCampaignBid, banZone } from './propeller';

export type AIActionType = 'PAUSE_CAMPAIGN' | 'START_CAMPAIGN' | 'UPDATE_BID' | 'BLOCK_ZONE';

export interface AIActionRequest {
  actionType: AIActionType;
  campaignId: string | number;
  entityId?: string; // zone_id or creative_id
  value?: number; // bid amount
  reason: string;
}

export async function executeAIAction(request: AIActionRequest) {
  console.log(`🤖 Executing AI Action: ${request.actionType}`, request);

  // 1. Log the attempt
  const { data: logEntry, error: logError } = await supabase
    .from('ai_logs')
    .insert({
      category: 'execution',
      action: request.actionType,
      description: request.reason,
      entity_affected: `${request.campaignId}:${request.entityId || 'global'}`,
      execution_result: 'pending',
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to log execution start:', logError);
    // We proceed anyway? Or fail? Let's proceed but warn.
  }

  let result;
  let status = 'success';
  let errorMessage = null;

  try {
    switch (request.actionType) {
      case 'PAUSE_CAMPAIGN':
        result = await stopCampaign(request.campaignId);
        break;
      case 'START_CAMPAIGN':
        result = await startCampaign(request.campaignId);
        break;
      case 'UPDATE_BID':
        if (!request.value) throw new Error('Missing bid value');
        result = await setCampaignBid(request.campaignId, request.value);
        break;
      case 'BLOCK_ZONE':
        if (!request.entityId) throw new Error('Missing zone ID');
        result = await banZone(request.campaignId, request.entityId);
        break;
      default:
        throw new Error(`Unknown action type: ${request.actionType}`);
    }
  } catch (error: any) {
    console.error('Execution Failed:', error);
    status = 'failed';
    errorMessage = error.message;
  }

  // 2. Update log with result
  if (logEntry?.id) {
    await supabase
      .from('ai_logs')
      .update({
        execution_result: status,
        data_snapshot: errorMessage ? { error: errorMessage } : { result }
      })
      .eq('id', logEntry.id);
  }

  return { success: status === 'success', result, error: errorMessage };
}
