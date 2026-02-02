import { Star } from 'lucide-react';

const TrustBadges = () => {
  const platforms = [
    {
      name: 'Яндекс Карты',
      rating: 4.9,
      reviews: 1847,
      logo: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <path fill="#FF0000" d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4z"/>
          <path fill="#FFFFFF" d="M24 10c-5.52 0-10 4.48-10 10 0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
      ),
      verified: true
    },
    {
      name: '2ГИС',
      rating: 4.8,
      reviews: 1234,
      logo: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <rect fill="#00A650" width="48" height="48" rx="8"/>
          <text x="24" y="32" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial">2ГИС</text>
        </svg>
      ),
      verified: true
    },
    {
      name: 'Отзовик',
      rating: 4.9,
      reviews: 892,
      logo: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <circle fill="#0088CC" cx="24" cy="24" r="20"/>
          <path fill="#FFFFFF" d="M24 12c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          <circle fill="#FFFFFF" cx="24" cy="24" r="3"/>
        </svg>
      ),
      verified: true
    },
    {
      name: 'IRecommend',
      rating: 4.8,
      reviews: 654,
      logo: (
        <svg viewBox="0 0 48 48" className="w-8 h-8">
          <rect fill="#7B68EE" width="48" height="48" rx="8"/>
          <path fill="#FFFFFF" d="M24 14l3.5 10.5h11l-9 6.5 3.5 10.5-9-6.5-9 6.5 3.5-10.5-9-6.5h11z"/>
        </svg>
      ),
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
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="relative bg-card border-2 border-border rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center justify-center">
                      {platform.logo}
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
