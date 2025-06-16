import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="flex flex-col items-center mb-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Shahmatki
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {session?.user?.name
                ? `Добро пожаловать, ${session.user.name}!`
                : "Добро пожаловать в мир шахмат!"}
            </p>
            <p className="text-lg text-muted-foreground">
              Изучайте, играйте и совершенствуйтесь вместе с нашим сообществом
            </p>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl leading-tight">
                Сообщество
              </CardTitle>
              <CardDescription>
                Учитесь у других игроков и делитесь опытом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/articles">Читать статьи</Link>
                </Button>
                {session?.user ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/articles/new">Написать статью</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth">Войти, чтобы писать</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl leading-tight">Практика</CardTitle>
              <CardDescription>
                Тренируйтесь и улучшайте свои навыки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/play/bot">Играть с ботом</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/play/online">Играть с другом</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl leading-tight">Анализ</CardTitle>
              <CardDescription>
                Изучайте позиции и получайте оценки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/analysis">Оценить позицию</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats or Additional Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Активных игроков</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Обучающих статей</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Доступность</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
