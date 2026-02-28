import { NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    if (rating) {
      whereClause.rating = { gte: parseInt(rating) };
    }

    if (inStock === 'true') {
      whereClause.stock = { gt: 0 };
    }

    // Build order by clause
    const orderByClause: any = {};
    switch (sortBy) {
      case 'price':
        orderByClause.price = sortOrder;
        break;
      case 'rating':
        orderByClause.rating = sortOrder;
        break;
      case 'newest':
        orderByClause.createdAt = 'desc';
        break;
      default:
        orderByClause.name = sortOrder;
        break;
    }

    // Get products
    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        include: {
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stock: true,
              image: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: orderByClause,
        skip: (page - 1) * limit,
        take: limit
      }),
      db.product.count({ where: whereClause })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        query,
        category,
        minPrice,
        maxPrice,
        rating,
        inStock,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error("[PRODUCT_SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return new NextResponse("Product IDs are required", { status: 400 });
    }

    // Get products for comparison
    const products = await db.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            image: true
          }
        },
        features: true,
        reviews: {
          select: {
            rating: true,
            content: true
          }
        }
      }
    });

    return NextResponse.json({
      products
    });

  } catch (error) {
    console.error("[PRODUCT_COMPARE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
