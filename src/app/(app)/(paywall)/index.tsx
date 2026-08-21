import ChampoPaywallModal from '@/features/subscription/screens/ChamoPaywallModal';
import { usePaywallRouteControls } from '@/providers/PaywallProvider';
import { useEffect } from 'react';

export default function PaywallScreen() {
  const { finishPaywall, abandonPaywall } = usePaywallRouteControls();

  useEffect(() => abandonPaywall, [abandonPaywall]);

  return <ChampoPaywallModal onComplete={finishPaywall} />;
}
