import React from "react";
import { motion } from "framer-motion";
import { useListProjects } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ExternalLink, Github, Code, FolderGit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Portfolio() {
  const { data: projects, isLoading } = useListProjects();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.2)] flex items-center gap-3">
            <FolderGit2 className="w-8 h-8 text-primary" />
            PORTFOLIO
          </h1>
          <p className="text-muted-foreground mt-2">Manage and showcase your technical achievements.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl bg-card border border-border/50" />
          ))}
        </div>
      ) : projects?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/portfolio/${project.id}`}>
                <Card className="h-full overflow-hidden border-border/50 bg-card/40 backdrop-blur shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:border-primary/50 transition-all duration-300 cursor-pointer group flex flex-col">
                  {project.imageUrl && (
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10" />
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                        <p className="text-sm text-secondary font-medium">{project.category}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.techStack.slice(0, 3).map(tech => (
                        <Badge key={tech} variant="outline" className="bg-background/50 border-border/50 text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 3 && (
                        <Badge variant="outline" className="bg-background/50 border-border/50 text-xs">
                          +{project.techStack.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/20">
          <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Initialize your portfolio by adding your first project.</p>
        </div>
      )}
    </motion.div>
  );
}
