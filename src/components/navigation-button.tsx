import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
interface NavigationElementProps{
  title: string,
  link: string
}
const Navigation = ({title, elements}: {title: string, elements:NavigationElementProps[]}) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-foreground">{title}</NavigationMenuTrigger>
          <NavigationMenuContent>

            {elements.map((element, index)=> (
              <NavigationMenuLink
                key={index}
                href={element.link}>
                  {element.title}
              </NavigationMenuLink>
            ))}

          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default Navigation