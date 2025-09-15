'use client'

import PillNav from "@/blocks/Components/PillNav/PillNav";
import { HiCash } from "react-icons/hi";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Chamar API de logout
      await fetch('/api/auth/login', {
        method: 'DELETE'
      })

      // Redirecionar para login
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, redirecionar para login
      router.push('/login')
    }
  }

  return (
    <div className="mb-6 lg:mb-26 flex flex-col lg:flex-row align-center text-center justify-between items-center fixed top-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-md lg:relative lg:bg-transparent lg:backdrop-blur-none px-2 sm:px-4 lg:px-0 w-full">
      <div className="flex bg-transparent border-2 text-[#FDF9EF] gap-2 mt-5 mx-auto lg:ml-4 lg:mx-0 items-center rounded-full px-4 py-2">
        <HiCash size={18}/>
        <span className="text-sm font-medium">R$ 1.250,00</span>
      </div>
      <div className="flex-1 flex justify-center mt-4 lg:mt-0">
        <PillNav
          items={[
            { label: 'Home', href: '/' },
            { label: 'Orders', href: '/orders' },
            { label: 'Sessions', href: '/sessions' }
          ]}
          activeHref="/"
          className="custom-nav p-1"
          ease="power2.easeOut"
          baseColor="#645394"
          pillColor="#171717"
          hoveredPillTextColor="#FBF8F1"
          pillTextColor="#FDF9EF"
        />
      </div>
      <div className="w-32 hidden lg:flex justify-end items-center">
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-[#FDF9EF] hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
}