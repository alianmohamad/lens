"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, FolderOpen, MoreVertical, Trash2, Pencil, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    name: string;
    thumbnail: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function StudioProjectsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Rename dialog state
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameProject, setRenameProject] = useState<Project | null>(null);
    const [newName, setNewName] = useState("");

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteProject, setDeleteProject] = useState<Project | null>(null);

    // Fetch projects
    useEffect(() => {
        if (status === "authenticated") {
            fetchProjects();
        }
    }, [status]);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            if (res.ok) {
                const data = await res.json();
                setProjects(data.projects);
            } else if (res.status === 401) {
                // User session invalid or user deleted - redirect to sign in
                toast.error("Session expired. Please sign in again.");
                router.push("/sign-in");
                return;
            }
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        setIsCreating(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Untitled Project" }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/studio/${data.project.id}`);
            } else {
                toast.error(data.error || "Failed to create project");
                // If user not found, redirect to sign in
                if (res.status === 401) {
                    router.push("/sign-in");
                }
            }
        } catch (error) {
            toast.error("Failed to create project");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRename = async () => {
        if (!renameProject || !newName.trim()) return;

        try {
            const res = await fetch(`/api/projects/${renameProject.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });

            if (res.ok) {
                setProjects(projects.map(p =>
                    p.id === renameProject.id ? { ...p, name: newName.trim() } : p
                ));
                toast.success("Project renamed");
            } else {
                toast.error("Failed to rename project");
            }
        } catch (error) {
            toast.error("Failed to rename project");
        } finally {
            setRenameDialogOpen(false);
            setRenameProject(null);
            setNewName("");
        }
    };

    const handleDelete = async () => {
        if (!deleteProject) return;

        try {
            const res = await fetch(`/api/projects/${deleteProject.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setProjects(projects.filter(p => p.id !== deleteProject.id));
                toast.success("Project deleted");
            } else {
                toast.error("Failed to delete project");
            }
        } catch (error) {
            toast.error("Failed to delete project");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteProject(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Auth redirect
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in");
        }
    }, [status, router]);

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Header Section */}
            <div className="relative pt-24 pb-12 border-b border-border/40 overflow-hidden">
                <div className="absolute inset-0 mesh-gradient opacity-30" />
                <div className="absolute inset-0 bg-linear-to-b from-transparent to-background" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-md">
                                <FolderOpen className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Studio Projects</h1>
                                <p className="text-muted-foreground text-lg">Manage your creative workspace</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateProject}
                            disabled={isCreating}
                            className="btn-premium rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                    >
                        <div className="h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
                            <FolderOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">No projects yet</h2>
                        <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">
                            Create your first project to start designing product photos with AI.
                        </p>
                        <Button
                            onClick={handleCreateProject}
                            disabled={isCreating}
                            size="lg"
                            className="btn-premium rounded-xl px-8 h-12 text-base"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create First Project
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* New Project Card */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={handleCreateProject}
                            disabled={isCreating}
                            className={cn(
                                "group aspect-4/3 rounded-3xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-card/30 hover:bg-card/80 transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:shadow-primary/5 backdrop-blur-sm",
                                isCreating && "opacity-50 cursor-wait"
                            )}
                        >
                            <div className="h-16 w-16 rounded-full bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:scale-110">
                                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-muted-foreground group-hover:text-primary font-medium transition-colors text-lg font-display">
                                Create New
                            </span>
                        </motion.button>

                        {/* Project Cards */}
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative"
                            >
                                <button
                                    onClick={() => router.push(`/studio/${project.id}`)}
                                    className="w-full aspect-4/3 rounded-3xl bento-card overflow-hidden group-hover:-translate-y-1 relative"
                                >
                                    {/* Thumbnail */}
                                    <div className="absolute inset-0 bg-muted/30">
                                        {project.thumbnail ? (
                                            <img
                                                src={project.thumbnail}
                                                alt={project.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 gap-3">
                                                <FolderOpen className="h-12 w-12 text-muted-foreground/20" />
                                                <span className="text-xs font-mono text-muted-foreground/30">NO PREVIEW</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Project info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                                        <h3 className="text-white font-display font-bold text-lg text-left truncate mb-1.5 drop-shadow-md">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{formatDate(project.updatedAt)}</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Actions Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 text-white border border-white/10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="glass-strong border-white/10">
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setRenameProject(project);
                                                setNewName(project.name);
                                                setRenameDialogOpen(true);
                                            }}
                                            className="focus:bg-muted cursor-pointer"
                                        >
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDeleteProject(project);
                                                setDeleteDialogOpen(true);
                                            }}
                                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent className="glass-strong">
                    <DialogHeader>
                        <DialogTitle>Rename Project</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Project name"
                        className="bg-background border-input"
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename} className="btn-premium">
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="glass-strong">
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                        Are you sure you want to delete "{deleteProject?.name}"? This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} variant="destructive">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
