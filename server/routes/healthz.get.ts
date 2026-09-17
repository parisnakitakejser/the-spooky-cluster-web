// Liveness and readiness target for the Deployment probes.
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain')
  return 'ok\n'
})
