'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful installation
    const installedHandler = () => {
      toast.success('App installed successfully!', {
        description: 'You can now use TindaKo from your home screen.',
        duration: 5000,
      });
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Show loading toast
    const loadingToast = toast.loading('Waiting for installation...');

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    if (outcome === 'accepted') {
      // Success toast will be shown by the appinstalled event listener
      console.log('PWA installation accepted');
    } else {
      // User dismissed the install prompt
      toast.info('Installation cancelled', {
        description: 'You can install the app later from the menu.',
      });
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Don't show anything if already installed and not iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleInstallClick}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
      >
        Install App
      </button>

      {showIOSInstructions && isIOS && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">To install on iOS:</p>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right</li>
          </ol>
        </div>
      )}
    </div>
  );
}
