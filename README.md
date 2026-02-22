# Laffa - Artisan Handcrafted Crochet Flowers E-Commerce

**Laffa** is a sophisticated, full-stack e-commerce platform dedicated to the art of crochet. Built with a focus on high performance, scalability, and a seamless user experience, it bridges traditional handicraft with modern software engineering.

**Live Demo: [laffa.page](https://laffa.page)

---

##Key Features in Detail

###Advanced Internationalization (i18n)
* Triple Language Support:Fully localized in Turkish, English, and Arabic.
* RTL Support:Native Right-to-Left (RTL) layout switching for Arabic, ensuring a natural reading experience for all users.
* Dynamic Translation: Uses a structured JSON-based translation system for easy scalability of content.

###Robust Admin Ecosystem
* Full CRUD Functionality:Seamlessly create, read, update, and delete products and categories via a secure dashboard.
* Smart Schema: Recently refactored the database architecture to support a **Dynamic Flower Type** system (moving from Enums to Flexible Strings), allowing for an infinite variety of flower species.
* Security: Protected routes and secure API endpoints to prevent unauthorized access to the management layer.

###High-Performance Media Management
* Cloudinary Integration: Leverages professional cloud storage for product images and videos.
* Optimized Delivery: Automated image resizing and optimization to ensure fast loading times without compromising on visual quality.

###Modern Tech Stack & Architecture
* Server-Side Excellence: Built with **Next.js 14/15 (App Router)** for optimized SEO and blazing-fast Server Components.
* Type Safety:Written entirely in **TypeScript**, ensuring code reliability and reducing runtime errors.
* Database Management:** Powered by **PostgreSQL** and orchestrated by **Prisma ORM** for type-safe database queries and migrations.

---

##Technical Specifications

| **Framework** | Next.js (React) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Media** | Cloudinary API |
| **Deployment** | Vercel |

---

## Local Development Setup

Follow these steps to get the project running on your local machine:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/haninalkahat/flowershop-template.git](https://github.com/haninalkahat/flowershop-template.git)
   cd flowershop-template
2. Install Dependencies:
    npm install
3. Configure Environment Variables:
Create a .env file in the root directory and add your credentials:
 DATABASE_URL="your_postgresql_url"
 CLOUDINARY_CLOUD_NAME="your_name"
 CLOUDINARY_API_KEY="your_key"
 CLOUDINARY_API_SECRET="your_secret"   
4. Sync Database Schema:
    npx prisma db push
5.Run Development Server:
  npm run dev 

   
