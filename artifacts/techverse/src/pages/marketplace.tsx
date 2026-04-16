import React, { useState } from "react";
import { motion } from "framer-motion";
import { useListServices, useGetServiceCategories } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Search, Filter, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data: categories, isLoading: catsLoading } = useGetServiceCategories();
  const { data: services, isLoading } = useListServices({ category: selectedCategory, limit: 20 });

  const filtered = services?.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">MARKETPLACE</h1>
          <p className="text-muted-foreground mt-1">Discover elite developer services</p>
        </div>
        <Link href="/services/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/80 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            + List Service
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-card border-border focus:border-primary/50"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-border hover:border-primary/50 gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${!selectedCategory ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'border-border text-muted-foreground hover:border-primary/30'}`}
        >
          All
        </button>
        {catsLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-28 rounded-full bg-muted/50" />)
        ) : (
          categories?.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name === selectedCategory ? undefined : cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${selectedCategory === cat.name ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'border-border text-muted-foreground hover:border-primary/30'}`}
            >
              {cat.name} <span className="opacity-60">({cat.count})</span>
            </button>
          ))
        )}
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-muted/30" />
          ))
        ) : filtered?.length ? (
          filtered.map(service => (
            <motion.div key={service.id} variants={cardVariants}>
              <Link href={`/services/${service.id}`}>
                <Card className="h-full border-border/50 bg-card/40 backdrop-blur hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-300 cursor-pointer group overflow-hidden">
                  {service.imageUrl && (
                    <div className="relative h-40 overflow-hidden bg-muted">
                      <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors line-clamp-2">{service.title}</CardTitle>
                      <Badge variant="outline" className="border-secondary/50 text-secondary shrink-0">{service.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {service.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-sm font-medium">{service.rating?.toFixed(1) || "New"}</span>
                        <span className="text-xs text-muted-foreground">({service.reviewCount || 0})</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {service.deliveryDays}d
                        </span>
                        <span className="font-bold text-primary flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />{service.price?.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4 opacity-30" />
            <p className="text-lg font-medium text-muted-foreground">No services found</p>
            <p className="text-sm text-muted-foreground/60">Be the first to list a service in this category</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

