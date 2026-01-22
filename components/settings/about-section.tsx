'use client'

import { Card } from '@/components/ui/card'
import { ExternalLink, Github, Mail, FileText, Shield } from 'lucide-react'

export function AboutSection() {
  const version = '0.1.0'

  return (
    <Card className="p-4 lg:p-6">
      <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">About</h2>
      <div className="space-y-3 lg:space-y-4">
        <div className="space-y-1">
          <p className="text-xs lg:text-sm font-medium">TindaKo POS</p>
          <p className="text-[10px] lg:text-xs text-muted-foreground">
            Offline-first Point of Sale for Philippine Sari-Sari stores
          </p>
          <p className="text-[10px] lg:text-xs text-muted-foreground">
            Version {version}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs lg:text-sm font-medium">Links</p>
          <div className="space-y-1.5">
            <a
              href="https://github.com/yourusername/tindako"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3 w-3 lg:h-4 lg:w-4" />
              GitHub Repository
              <ExternalLink className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </a>
            <a
              href="mailto:support@tindako.app"
              className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-3 w-3 lg:h-4 lg:w-4" />
              Support Email
            </a>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs lg:text-sm font-medium">Legal</p>
          <div className="space-y-1.5">
            <a
              href="#"
              className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
              Privacy Policy
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Shield className="h-3 w-3 lg:h-4 lg:w-4" />
              Terms of Service
            </a>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-[10px] lg:text-xs text-muted-foreground">
            Built with Next.js 16, React 19, Supabase, and Dexie.js
          </p>
          <p className="text-[10px] lg:text-xs text-muted-foreground mt-1">
            © 2026 TindaKo. All rights reserved.
          </p>
        </div>
      </div>
    </Card>
  )
}
