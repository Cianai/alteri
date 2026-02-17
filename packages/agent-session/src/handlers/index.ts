import type { LinearAgentClient } from '../linear-client'
import type { HandlerContext, IntentType } from '../types'
import { handleStatus } from './status'
import { handleExpand } from './expand'
import { handleHelp } from './help'

export { handleStatus } from './status'
export { handleExpand } from './expand'
export { handleHelp } from './help'

export async function routeIntent(
  intent: IntentType,
  ctx: HandlerContext,
  client: LinearAgentClient,
): Promise<string> {
  switch (intent) {
    case 'status':
      return handleStatus(ctx, client)
    case 'expand':
      return handleExpand(ctx)
    case 'help':
      return handleHelp()
    case 'unknown':
      return handleHelp()
  }
}
