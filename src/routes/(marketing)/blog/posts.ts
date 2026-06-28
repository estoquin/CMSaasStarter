export const blogInfo = {
  name: "Blog de SaaS Starter",
  description: "Un blog de muestra",
}

export type BlogPost = {
  link: string
  date: string // date is a string 'YYYY-MM-DD'
  title: string
  description: string
  parsedDate?: Date // Optional because it's added dynamically
}

// Update this list with the actual blog post list
// Create a page in the "(posts)" directory for each entry
const blogPosts: BlogPost[] = [
  {
    title: "Cómo construimos un hermoso sitio SaaS de 41kb con esta plantilla",
    description: "Cómo usar esta plantilla para impulsar tu propio sitio.",
    link: "/blog/how_we_built_our_41kb_saas_website",
    date: "2024-03-10",
  },
  {
    title: "Entrada de Blog de Ejemplo 2",
    description: "¡Aún más contenido de ejemplo!",
    link: "/blog/awesome_post",
    date: "2022-9-23",
  },
  {
    title: "Entrada de Blog de Ejemplo",
    description: "Una entrada de blog de muestra que muestra nuestro motor de blog",
    link: "/blog/example_blog_post",
    date: "2023-03-13",
  },
]

// Parse post dates from strings to Date objects
for (const post of blogPosts) {
  if (!post.parsedDate) {
    const dateParts = post.date.split("-")
    post.parsedDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
    ) // Note: months are 0-based
  }
}

export const sortedBlogPosts = blogPosts.sort(
  (a: BlogPost, b: BlogPost) =>
    (b.parsedDate?.getTime() ?? 0) - (a.parsedDate?.getTime() ?? 0),
)
