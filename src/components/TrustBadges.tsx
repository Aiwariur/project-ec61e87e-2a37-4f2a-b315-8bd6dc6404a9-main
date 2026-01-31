import { Star, MapPin, MessageCircle, ThumbsUp } from 'lucide-react';

const TrustBadges = () => {
  const platforms = [
    {
      name: 'Яндекс Карты',
      rating: 4.9,
      reviews: 1847,
      color: 'from-red-500 to-yellow-500',
      icon: MapPin,
      verified: true
    },
    {
      name: '2ГИС',
      rating: 4.8,
      reviews: 1234,
      color: 'from-green-500 to-emerald-600',
      icon: MapPin,
      verified: true
    },
    {
      name: 'Отзовик',
      rating: 4.9,
      reviews: 892,
      color: 'from-blue-500 to-cyan-500',
      icon: MessageCircle,
      verified: true
    },
    {
      name: 'IRecommend',
      rating: 4.8,
      reviews: 654,
      color: 'from-purple-500 to-pink-500',
      icon: ThumbsUp,
      verified: true
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            Нам доверяют на всех площадках
          </h3>
          <p className="text-muted-foreground">
            Проверенные отзывы от реальных покупателей
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity rounded-2xl blur-xl"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${platform.color.split(' ')[1]}, ${platform.color.split(' ')[3]})`
                  }}
                />
                <div className="relative bg-card border-2 border-border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${platform.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {platform.verified && (
                      <div className="flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-lg font-bold text-foreground mb-1">
                      {platform.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold text-foreground">
                          {platform.rating}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        / 5.0
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{platform.reviews.toLocaleString()}</span> отзывов
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/30">
            <Star className="w-5 h-5 text-primary fill-primary" />
            <span className="font-semibold text-foreground">
              Общий рейтинг: <span className="text-primary text-xl">4.85</span> из 5
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Более <span className="font-semibold text-foreground">4,600</span> отзывов
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
