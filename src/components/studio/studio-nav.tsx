
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, LayoutGrid, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StudioNav() {
    return (
        <header className="flex items-center justify-between px-6 py-4 pointer-events-auto w-full">
            {/* Left: Back & Branding */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/50">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide font-display">ZeroLens Studio</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-medium">Untitled Project</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20">Beta</span>
                    </div>
                </div>
            </div>

            {/* Center: Maybe Toolkit? (Optional) */}

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-slate-300 hover:text-white hover:bg-slate-800">
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Export</span>
                </Button>
                <div className="h-4 w-px bg-slate-800" />
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8 border border-slate-700">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="bg-slate-800 text-slate-300 text-xs">A</AvatarFallback>
                    </Avatar>
                </Button>
            </div>
        </header>
    )
}
