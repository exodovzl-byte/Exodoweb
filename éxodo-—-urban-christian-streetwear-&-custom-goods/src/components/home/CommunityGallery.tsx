import React from 'react';
import { Instagram, Sparkles, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { INITIAL_COMMUNITY_POSTS } from '../../data/initialData';

export const CommunityGallery: React.FC = () => {
  const { communityPosts, socialLinks } = useStore();
  const posts = communityPosts && communityPosts.length > 0 ? communityPosts : INITIAL_COMMUNITY_POSTS;
  const instagramUrl = socialLinks?.instagram?.url || 'https://instagram.com/exodo.vzl';

  return (
    <section className="bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400">
              <Sparkles size={13} />
              <span>Comunidad ÉXODO Caracas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-brand-heading">
              #DIOSFUERADELTEMPLO
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Nuestra fe no se queda en las bancas. Camina en el bulevar de Sabana Grande, en la universidad, en el metro y en cada rincón de Venezuela.
            </p>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-200 text-xs font-bold uppercase tracking-wider transition-colors self-start md:self-auto cursor-pointer"
          >
            <Instagram size={15} className="text-pink-400" />
            <span>Únete en Instagram ({socialLinks?.instagram?.username || '@exodo.vzl'})</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Mosaic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.postUrl || instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 block cursor-pointer"
              title="Abrir publicación en Instagram"
            >
              {/* Image Frame */}
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
                <img
                  src={post.image}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Platform Tag */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1 border border-neutral-800">
                  {post.platform === 'instagram' ? (
                    <Instagram size={12} className="text-pink-400" />
                  ) : (
                    <span className="text-cyan-400 font-bold">TT</span>
                  )}
                  <span>{post.username}</span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 flex flex-col justify-between flex-grow">
                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                  {post.caption}
                </p>

                <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-amber-400 font-semibold">{post.tag}</span>
                  <span className="text-neutral-500 text-[10px]">Caracas, VZLA</span>
                </div>
              </div>

            </a>
          ))}
        </div>

        {/* Community Tag banner */}
        <div className="mt-10 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 text-center">
          <p className="text-xs text-neutral-400">
            ¿Tienes una prenda ÉXODO? Sube tu foto etiquetando a <strong className="text-white">@exodo.vzl</strong> y usando el hashtag <strong className="text-amber-400">#Diosfueradeltemplo</strong> para aparecer en el feed oficial.
          </p>
        </div>

      </div>
    </section>
  );
};
