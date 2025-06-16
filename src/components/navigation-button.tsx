import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface NavigationElementProps {
  title: string;
  link: string;
}

const Navigation = ({
  title,
  elements,
}: {
  title: string;
  elements: NavigationElementProps[];
}) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-foreground">
            {title}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-max min-w-[200px] p-2">
              {elements.map((element, index) => (
                <NavigationMenuLink
                  key={index}
                  href={element.link}
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                >
                  {element.title}
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navigation;
