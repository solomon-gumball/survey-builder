export const Environments = [
  { name: 'stage', hostname: 'stage-api.apps.gigwalk.com' },
  { name: 'beta', hostname: 'beta-api.app.gigwalk.com' },
  { name: 'enterprise', hostname: 'api.enterprise.gigwalk.com' },
  { name: 'prod (multi-tenant)', hostname: 'api.app.gigwalk.com' },
  { name: 'partner-dev', hostname: 'partner-dev-api.enterprise.gigwalk.com' },
  { name: 'partner-stage', hostname: 'partner-api.apps.gigwalk.com' },
  { name: 'japan-prod', hostname: 'api.jp.gigwalk.com' },
  { name: 'japan-sandbox', hostname: 'sandbox-api.jp.gigwalk.com' },
  { name: 'japan-staging', hostname: 'staging-api.jp.gigwalk.com' },
]

Environments.withName = function(name) {
  return Environments.find(env => env.name === name)
}
