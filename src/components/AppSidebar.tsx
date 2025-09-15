'use client'

import { AppRegisterProductDialog } from "./AppRegisterProductDialog";
import {
  Home,
  ChartNetwork,
  User2,
  ChevronUp,
  Plus,
  Box,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,

  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AnimatedContent from "@/blocks/Animations/AnimatedContent/AnimatedContent";
import Image from "next/image";
import { FaProductHunt } from "react-icons/fa6";


const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Sessions",
    url: "/sessions",
    icon: ChartNetwork ,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Box,
  }
];

const AppSidebar = () => {
  return (
    <AnimatedContent
      distance={200}
      direction="vertical"
      reverse={false}
      duration={2}
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
      delay={0}
    >
    <Sidebar collapsible="icon">
      <SidebarHeader className="items-center pl-4 align-center">
        <Image
          src="/logo.svg"
          alt="logo"
          width={40}
          height={40}
        />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FDF9EF] text-md">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.title === "Home" || item.title === "Sessions" || item.title === "Orders" ? (
                    <SidebarMenuButton asChild isActive={true}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton asChild isActive={true}>
                      <div className="cursor-pointer">
                        <item.icon />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  )}
                  {item.title === "Inbox" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FDF9EF] text-md">Projects</SidebarGroupLabel>
          <SidebarGroupAction className="cursor-pointer">
            <Plus /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <Link href="/products" className="cursor-pointer">
                    <FaProductHunt />
                    See All Products
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AppRegisterProductDialog>
                  <SidebarMenuButton asChild isActive={true}>
                    <div className="cursor-pointer">
                      <Plus />
                      Add Product
                    </div>
                  </SidebarMenuButton>
                </AppRegisterProductDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  <User2 /> Lula <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Account</DropdownMenuItem>
                <DropdownMenuItem>Setting</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  </AnimatedContent>
  );
};

export default AppSidebar;