import { Award, Users, ShieldCheck, TrendingUp } from 'lucide-react';

const SocialProof = () => {
  const stats = [
    {
      icon: Award,
      value: '15+',
      label: 'лет на рынке',
      description: 'Работаем с 2009 года'
    },
    {
      icon: Users,
      value: '12,000+',
      label: 'довольных клиентов',
      description: 'По всей России'
    },
    {
      icon: ShieldCheck,
      value: '100%',
      label: 'гарантия качества',
      description: 'На всех попугаев'
    },
    {
      icon: TrendingUp,
      value: '98%',
      label: 'повторных покупок',
      description: 'Клиенты возвращаются'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Нам доверяют тысячи любителей попугаев
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Мы — крупнейший специализированный магазин экзотических попугаев в России. 
            За 15 лет работы мы помогли найти пернатых друзей более чем 12,000 семьям.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/5 rounded-full border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              Официальный импортёр • Все документы и сертификаты • Ветеринарный контроль
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
