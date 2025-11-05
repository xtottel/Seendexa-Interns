
// app/ops/layout.tsx
"use client";
import type React from "react";
//import { AppSidebar } from "@/layout/app-sidebar";
import { AppSidebar } from "@/layout/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DesktopHeader } from "@/layout/desktop-header";
import { MobileHeader } from "@/layout/mobile-header";
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'


export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])



  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {/* Using a loading GIF */}
        <Image
          src="/exaloader.gif"
          alt="Loading..."
          width={100}
          height={100}
          className="mb-4"
        />
      </div>
    )
  }
 

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        {/* Persistent Sidebar */}
        <AppSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header (hidden on desktop) */}
          <div className="lg:hidden sticky top-0 z-40">
            <MobileHeader />
          </div>

          {/* Desktop Header (hidden on mobile) */}
          <div className="hidden lg:block sticky top-0 z-40">
            <DesktopHeader />
          </div>

          {/* Content area with consistent padding */}
         
          <main className="flex-1 w-full ">
            <div className="w-full max-w-full py-2 px-2 sm:px-6">
              {children}
            </div>
          </main>
         
        </div>
      </div>
    </SidebarProvider>
  );
}