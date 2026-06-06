export function logStep(tcId: string, stepNo: number, message: string): void {
  console.log(`[${tcId}] Bước ${stepNo}: ${message}`);
}
