import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetMe, useUpdateMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/react";
import { Settings, User, Globe, Github, Linkedin, MapPin, Save, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user: clerkUser } = useUser();
  const { data: profile, isLoading } = useGetMe();
  const updateProfile = useUpdateMe();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    skills: [] as string[],
    newSkill: "",
  });

  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        name: profile.name || clerkUser?.fullName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
      }));
    }
  }, [profile, clerkUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        data: {
          name: form.name,
          bio: form.bio || undefined,
          location: form.location || undefined,
          website: form.website || undefined,
          github: form.github || undefined,
          linkedin: form.linkedin || undefined,
          skills: form.skills,
        }
      });
      toast({ title: "Profile updated", description: "Your settings have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to save profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (form.newSkill && !form.skills.includes(form.newSkill)) {
      setForm(f => ({ ...f, skills: [...f.skills, f.newSkill], newSkill: "" }));
    }
  };

  const removeSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">SYSTEMS</h1>
          <p className="text-muted-foreground mt-1">Configure your TechVerse profile</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 bg-muted/30 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-sm uppercase tracking-wider">
                <User className="w-4 h-4" /> Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Display Name</label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="bg-background border-border focus:border-primary/50"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <Input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="bg-background border-border focus:border-primary/50"
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full min-h-[100px] bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Tell the world about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary text-sm uppercase tracking-wider">
                <Globe className="w-4 h-4" /> Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "website" as const, icon: Globe, placeholder: "https://yoursite.com", label: "Website" },
                { key: "github" as const, icon: Github, placeholder: "github.com/username", label: "GitHub" },
                { key: "linkedin" as const, icon: Linkedin, placeholder: "linkedin.com/in/username", label: "LinkedIn" },
              ].map(({ key, icon: Icon, placeholder, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icon className="w-3 h-3" /> {label}
                  </label>
                  <Input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="bg-background border-border focus:border-primary/50"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-sm uppercase tracking-wider">
                <Settings className="w-4 h-4" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 border border-primary/30 text-primary">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={form.newSkill}
                  onChange={e => setForm(f => ({ ...f, newSkill: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  className="bg-background border-border focus:border-primary/50"
                  placeholder="Add a skill (e.g. React, TypeScript, AWS)"
                />
                <Button onClick={addSkill} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
