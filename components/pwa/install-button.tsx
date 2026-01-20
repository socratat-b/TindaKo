'use client';

import { useEffect, useState } from 'react';

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

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
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
