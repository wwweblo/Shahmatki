import Link from "next/link";
import Navigation from "./navigation-button";
import UserAuth from "@/components/auth/user-auth-navigation";
import ToggleThemeButton from "./tiggleThemeButton";

export default function Header() {
  const articlesNavigation = [
    { title: "Читать", link: "/articles" },
    { title: "Написать", link: "/articles/new" },
  ];
  const chessNavigation = [
    { title: "Играть с ботом", link: "play/bot" },
    { title: "Играть с другом", link: "play/online" },
  ];

  return (
    <header className="flex py-2 px-5 shadow">
      <div className="flex-shrink-0 flex items-center">
        <Link href="/" className="text-2xl font-bold text-foreground">
          Shahmatki
        </Link>
      </div>
      <ToggleThemeButton />
      <nav className="w-full flex justify-between">
        <div className="flex">
          <Navigation title="Статьи" elements={articlesNavigation} />
          <Navigation title="Играть" elements={chessNavigation} />
        </div>

        {/* User Login */}
        <UserAuth />
      </nav>
    </header>
  );
}
