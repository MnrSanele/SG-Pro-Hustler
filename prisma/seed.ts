import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed...");

  // ─── Categories & Skills ─────────────────────────────────────────────────────
  const categoryData = [
    {
      name: "Painting", slug: "painting", icon: "🎨", color: "#FF6B6B",
      skills: ["Interior Painting", "Exterior Painting", "Spray Painting", "Decorative Finishes", "Waterproofing", "Surface Preparation"],
    },
    {
      name: "Plumbing", slug: "plumbing", icon: "🔧", color: "#4ECDC4",
      skills: ["Pipe Installation", "Leak Repairs", "Drain Cleaning", "Geyser Installation", "Bathroom Fitting", "Water Pressure Issues"],
    },
    {
      name: "Electrical", slug: "electrical", icon: "⚡", color: "#FFE66D",
      skills: ["Wiring & Rewiring", "DB Board Installation", "Fault Finding", "Light Fitting", "Solar Installation", "Prepaid Meter Installation"],
    },
    {
      name: "Building & Renovation", slug: "building-renovation", icon: "🏗️", color: "#A8E6CF",
      skills: ["Bricklaying", "Concrete Work", "Extensions", "Demolition", "Foundation Work", "Drywall Installation"],
    },
    {
      name: "Tiling", slug: "tiling", icon: "🪟", color: "#DDA0DD",
      skills: ["Floor Tiling", "Wall Tiling", "Grouting", "Waterproofing", "Tile Removal", "Mosaic Work"],
    },
    {
      name: "Roofing", slug: "roofing", icon: "🏠", color: "#F7DC6F",
      skills: ["Roof Installation", "Leak Repairs", "Waterproofing", "IBR Roofing", "Thatching", "Guttering"],
    },
    {
      name: "Welding", slug: "welding", icon: "🔥", color: "#E67E22",
      skills: ["MIG Welding", "TIG Welding", "Arc Welding", "Gate Fabrication", "Security Bars", "Metal Fabrication"],
    },
    {
      name: "Carpentry", slug: "carpentry", icon: "🪵", color: "#8B4513",
      skills: ["Cabinet Making", "Door Installation", "Deck Building", "Furniture Repair", "Roof Trusses", "Built-in Cupboards"],
    },
    {
      name: "Plastering", slug: "plastering", icon: "🧱", color: "#BDC3C7",
      skills: ["Interior Plastering", "Exterior Plastering", "Skimming", "Coving", "Crack Repairs", "Skim Coating"],
    },
    {
      name: "Handyman", slug: "handyman", icon: "🔨", color: "#95A5A6",
      skills: ["General Repairs", "Furniture Assembly", "Hanging & Mounting", "Door Repairs", "Window Repairs", "Minor Plumbing"],
    },
  ];

  const categories: Record<string, { id: string; skills: Record<string, string> }> = {};

  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, color: cat.color },
    });

    const skillMap: Record<string, string> = {};
    for (const skillName of cat.skills) {
      const slug = skillName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
      const skill = await prisma.skill.upsert({
        where: { slug },
        update: {},
        create: { name: skillName, slug, categoryId: created.id },
      });
      skillMap[skillName] = skill.id;
    }
    categories[cat.slug] = { id: created.id, skills: skillMap };
  }
  console.log("✅ Categories & Skills created");

  // ─── Badges ───────────────────────────────────────────────────────────────────
  const badges = [
    { name: "Top Rated", slug: "top-rated", icon: "⭐", color: "#FFD700", description: "Consistently rated 4.5+" },
    { name: "Quick Responder", slug: "quick-responder", icon: "⚡", color: "#4ECDC4", description: "Responds within 1 hour" },
    { name: "Verified Pro", slug: "verified-pro", icon: "✅", color: "#2ECC71", description: "ID and trade verified" },
    { name: "100+ Jobs", slug: "100-jobs", icon: "🏆", color: "#F39C12", description: "Completed 100+ jobs" },
    { name: "New Provider", slug: "new-provider", icon: "🌟", color: "#9B59B6", description: "Recently joined" },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge,
    });
  }
  console.log("✅ Badges created");

  // ─── Users ────────────────────────────────────────────────────────────────────
  const adminPassword = await hashPassword("Admin1234!");
  const testPassword = await hashPassword("Test1234!");

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@handyman.dev" },
    update: {},
    create: {
      email: "admin@handyman.dev",
      name: "Platform Admin",
      role: "ADMIN",
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "admin@handyman.dev",
          access_token: adminPassword,
        },
      },
    },
  });

  // Requesters
  const john = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Smith",
      role: "REQUESTER",
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "john@example.com",
          access_token: testPassword,
        },
      },
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      email: "sarah@example.com",
      name: "Sarah Johnson",
      role: "REQUESTER",
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "sarah@example.com",
          access_token: testPassword,
        },
      },
    },
  });

  // Create requester profiles
  for (const user of [john, sarah]) {
    await prisma.requesterProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  // Providers
  const providerData = [
    {
      email: "mike@example.com",
      name: "Mike Dlamini",
      slug: "mike-dlamini",
      bio: "Master painter with 15 years of experience in residential and commercial painting. Specializing in interior and exterior work with premium finishes.",
      tagline: "Quality finishes, on time, every time",
      mainTrade: "Painting",
      categorySlug: "painting",
      skills: ["Interior Painting", "Exterior Painting", "Spray Painting"],
      hourlyRate: 350,
      serviceAreas: ["Sandton", "Randburg", "Midrand"],
      averageRating: 4.8,
      reviewCount: 47,
      yearsExperience: 15,
    },
    {
      email: "james@example.com",
      name: "James Mokoena",
      slug: "james-mokoena",
      bio: "Licensed plumber specializing in residential repairs and installations. Available for emergency callouts.",
      tagline: "Fast, reliable plumbing solutions",
      mainTrade: "Plumbing",
      categorySlug: "plumbing",
      skills: ["Pipe Installation", "Leak Repairs", "Geyser Installation"],
      hourlyRate: 450,
      serviceAreas: ["Pretoria", "Centurion", "Midrand"],
      averageRating: 4.6,
      reviewCount: 32,
      yearsExperience: 10,
    },
    {
      email: "thandi@example.com",
      name: "Thandi Nkosi",
      slug: "thandi-nkosi",
      bio: "Qualified electrician with expertise in solar installations and DB board upgrades. COC certificates issued.",
      tagline: "Bright ideas, safe installations",
      mainTrade: "Electrical",
      categorySlug: "electrical",
      skills: ["Wiring & Rewiring", "DB Board Installation", "Solar Installation"],
      hourlyRate: 500,
      serviceAreas: ["Johannesburg", "Soweto", "Roodepoort"],
      averageRating: 4.9,
      reviewCount: 61,
      yearsExperience: 12,
    },
    {
      email: "sipho@example.com",
      name: "Sipho Zulu",
      slug: "sipho-zulu",
      bio: "Expert tiler with a passion for creating beautiful, durable surfaces. Specializes in luxury bathroom and kitchen tiling.",
      tagline: "Every tile tells a story",
      mainTrade: "Tiling",
      categorySlug: "tiling",
      skills: ["Floor Tiling", "Wall Tiling", "Mosaic Work"],
      hourlyRate: 380,
      serviceAreas: ["Durban", "Umhlanga", "Westville"],
      averageRating: 4.7,
      reviewCount: 28,
      yearsExperience: 8,
    },
    {
      email: "nomsa@example.com",
      name: "Nomsa Khumalo",
      slug: "nomsa-khumalo",
      bio: "Skilled carpenter specializing in custom built-in furniture, kitchen cabinets, and wooden decks. Bringing craftsmanship to every project.",
      tagline: "Crafting spaces you love",
      mainTrade: "Carpentry",
      categorySlug: "carpentry",
      skills: ["Cabinet Making", "Built-in Cupboards", "Deck Building"],
      hourlyRate: 420,
      serviceAreas: ["Cape Town", "Stellenbosch", "Paarl"],
      averageRating: 4.5,
      reviewCount: 19,
      yearsExperience: 9,
    },
  ];

  const providerProfiles: Record<string, string> = {};
  const providerUserIds: Record<string, string> = {};

  for (const pd of providerData) {
    const user = await prisma.user.upsert({
      where: { email: pd.email },
      update: {},
      create: {
        email: pd.email,
        name: pd.name,
        role: "PROVIDER",
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: pd.email,
            access_token: testPassword,
          },
        },
      },
    });

    const profile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        slug: pd.slug,
        bio: pd.bio,
        tagline: pd.tagline,
        mainTrade: pd.mainTrade,
        pricingModel: "HOURLY",
        hourlyRate: pd.hourlyRate,
        availableNow: Math.random() > 0.5,
        yearsExperience: pd.yearsExperience,
        serviceAreas: pd.serviceAreas,
        moderationStatus: "APPROVED",
        idVerificationStatus: "VERIFIED",
        averageRating: pd.averageRating,
        reviewCount: pd.reviewCount,
        profileStrength: 75,
        isFeatured: pd.reviewCount > 40,
      },
    });

    providerProfiles[pd.email] = profile.id;
    providerUserIds[pd.email] = user.id;

    // Add skills
    const catSkills = categories[pd.categorySlug]?.skills ?? {};
    for (const skillName of pd.skills) {
      const skillId = catSkills[skillName];
      if (skillId) {
        await prisma.providerSkill.upsert({
          where: { providerProfileId_skillId: { providerProfileId: profile.id, skillId } },
          update: {},
          create: {
            providerProfileId: profile.id,
            skillId,
            proficiencyRank: 1,
            isHighlighted: true,
          },
        });
      }
    }

    // Add portfolio projects
    await prisma.portfolioProject.create({
      data: {
        providerProfileId: profile.id,
        title: `${pd.mainTrade} Project - ${pd.serviceAreas[0]}`,
        description: `A beautiful ${pd.mainTrade.toLowerCase()} project completed in ${pd.serviceAreas[0]}. High-quality workmanship delivered on time and within budget.`,
        area: pd.serviceAreas[0],
        budgetRange: "R5,000 - R15,000",
        dateCompleted: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000),
        rolePerformed: pd.mainTrade,
        isPublished: true,
      },
    });
  }
  console.log("✅ Provider profiles created");

  // ─── Squads ───────────────────────────────────────────────────────────────────
  const squad1 = await prisma.squad.upsert({
    where: { slug: "gauteng-renovation-crew" },
    update: {},
    create: {
      name: "Gauteng Renovation Crew",
      slug: "gauteng-renovation-crew",
      description: "A premier team of renovation specialists covering all trades. We tackle complete home renovations from foundation to finish.",
      tagline: "Complete renovations done right",
      serviceAreas: ["Johannesburg", "Pretoria", "Midrand", "Sandton"],
      moderationStatus: "APPROVED",
      averageRating: 4.7,
      reviewCount: 23,
      projectsCompleted: 18,
      isFeatured: true,
      categories: {
        connect: [
          { slug: "painting" },
          { slug: "plumbing" },
          { slug: "electrical" },
          { slug: "tiling" },
        ],
      },
    },
  });

  // Add members to squad 1
  const squad1Members = [
    { email: "mike@example.com", role: "LEADER" as const },
    { email: "james@example.com", role: "MEMBER" as const },
    { email: "thandi@example.com", role: "MEMBER" as const },
  ];

  for (const member of squad1Members) {
    const userId = providerUserIds[member.email];
    const providerProfileId = providerProfiles[member.email];
    if (userId) {
      await prisma.squadMember.upsert({
        where: { squadId_userId: { squadId: squad1.id, userId } },
        update: {},
        create: {
          squadId: squad1.id,
          userId,
          providerProfileId,
          role: member.role,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });
    }
  }

  const squad2 = await prisma.squad.upsert({
    where: { slug: "cape-town-builders" },
    update: {},
    create: {
      name: "Cape Town Builders",
      slug: "cape-town-builders",
      description: "Experienced carpentry and tiling specialists based in Cape Town. Known for exceptional craftsmanship in residential renovations.",
      tagline: "Building dreams in the Mother City",
      serviceAreas: ["Cape Town", "Stellenbosch", "Somerset West"],
      moderationStatus: "APPROVED",
      averageRating: 4.5,
      reviewCount: 12,
      projectsCompleted: 9,
      categories: {
        connect: [{ slug: "carpentry" }, { slug: "tiling" }],
      },
    },
  });

  // Add members to squad 2
  const squad2Members = [
    { email: "nomsa@example.com", role: "LEADER" as const },
    { email: "sipho@example.com", role: "MEMBER" as const },
  ];

  for (const member of squad2Members) {
    const userId = providerUserIds[member.email];
    const providerProfileId = providerProfiles[member.email];
    if (userId) {
      await prisma.squadMember.upsert({
        where: { squadId_userId: { squadId: squad2.id, userId } },
        update: {},
        create: {
          squadId: squad2.id,
          userId,
          providerProfileId,
          role: member.role,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      });
    }
  }
  console.log("✅ Squads created");

  // ─── Jobs ─────────────────────────────────────────────────────────────────────
  const paintingCategoryId = categories["painting"]?.id;
  const plumbingCategoryId = categories["plumbing"]?.id;
  const electricalCategoryId = categories["electrical"]?.id;
  const tilingCategoryId = categories["tiling"]?.id;
  const carpentryId = categories["carpentry"]?.id;

  const jobsToCreate = [
    {
      requesterId: john.id,
      title: "Interior painting for 3-bedroom home",
      description: "Need a professional painter to paint the interior of my 3-bedroom home in Sandton. Walls and ceilings. Customer to supply paint. Approximately 200sqm total.",
      categoryId: paintingCategoryId,
      mode: "QUOTE_BASED" as const,
      status: "OPEN" as const,
      budgetMin: 5000,
      budgetMax: 12000,
      urgency: "this_week",
      location: "Sandton, Johannesburg",
      materialsProvided: true,
      requiredSkills: ["Interior Painting"],
    },
    {
      requesterId: sarah.id,
      title: "Urgent geyser replacement",
      description: "My geyser burst overnight and I need an urgent replacement. 200L geyser. I am in Pretoria East. Please bring your own materials and quote me.",
      categoryId: plumbingCategoryId,
      mode: "INSTANT" as const,
      status: "OPEN" as const,
      budgetMin: 3500,
      budgetMax: 6000,
      urgency: "immediate",
      location: "Pretoria East",
      requiredSkills: ["Geyser Installation"],
    },
    {
      requesterId: john.id,
      title: "Kitchen floor and wall tiling",
      description: "Looking for an experienced tiler to redo the kitchen floor and splash back. About 30sqm floor tiles and 15sqm wall tiles. Tiles already purchased.",
      categoryId: tilingCategoryId,
      mode: "QUOTE_BASED" as const,
      status: "OPEN" as const,
      budgetMin: 4000,
      budgetMax: 9000,
      location: "Durban North",
      materialsProvided: true,
      requiredSkills: ["Floor Tiling", "Wall Tiling"],
    },
    {
      requesterId: sarah.id,
      title: "Built-in bedroom cupboards",
      description: "Need custom built-in cupboards for master bedroom. Space is 4.5m wide x 2.4m high. Want standard melamine finish with sliding doors.",
      categoryId: carpentryId,
      mode: "QUOTE_BASED" as const,
      status: "OPEN" as const,
      budgetMin: 8000,
      budgetMax: 20000,
      urgency: "flexible",
      location: "Cape Town, Constantia",
      requiredSkills: ["Built-in Cupboards"],
    },
    {
      requesterId: john.id,
      title: "DB board upgrade to 3-phase",
      description: "My property needs an upgrade from single-phase to 3-phase electricity. DB board replacement and wiring. COC required.",
      categoryId: electricalCategoryId,
      mode: "INSTANT" as const,
      status: "OPEN" as const,
      budgetMin: 6000,
      budgetMax: 15000,
      location: "Midrand",
      requiredSkills: ["DB Board Installation", "Wiring & Rewiring"],
    },
  ];

  for (const jobData of jobsToCreate) {
    await prisma.job.create({
      data: {
        ...jobData,
        publishedAt: new Date(),
      },
    });
  }
  console.log("✅ Jobs created");

  // ─── Reviews ──────────────────────────────────────────────────────────────────
  const reviewTargets = [
    { authorId: john.id, providerEmail: "mike@example.com", rating: 5.0, comment: "Mike did an absolutely fantastic job painting our entire house. Very professional, clean, and efficient. Would hire again in a heartbeat!" },
    { authorId: sarah.id, providerEmail: "james@example.com", rating: 4.5, comment: "James fixed our leaking pipes quickly and professionally. Fair pricing and great workmanship." },
    { authorId: john.id, providerEmail: "thandi@example.com", rating: 5.0, comment: "Thandi is exceptional! She upgraded our entire DB board and installed solar in record time. Very knowledgeable and tidy." },
    { authorId: sarah.id, providerEmail: "sipho@example.com", rating: 4.8, comment: "Sipho tiled our bathroom beautifully. Great attention to detail, arrived on time every day. Highly recommended!" },
    { authorId: john.id, providerEmail: "nomsa@example.com", rating: 4.5, comment: "Nomsa built custom cupboards for our entire home. Excellent craftsmanship and good communication throughout." },
  ];

  for (const review of reviewTargets) {
    const providerProfileId = providerProfiles[review.providerEmail];
    const subjectUserId = providerUserIds[review.providerEmail];
    if (providerProfileId && subjectUserId) {
      await prisma.review.create({
        data: {
          authorId: review.authorId,
          subjectUserId,
          providerProfileId,
          overallRating: review.rating,
          comment: review.comment,
          isPublished: true,
          scoreBreakdown: {
            create: {
              quality: review.rating,
              professionalism: Math.min(5, review.rating + 0.2),
              punctuality: Math.max(3.5, review.rating - 0.3),
              communication: Math.min(5, review.rating + 0.1),
              valueForMoney: Math.max(3.5, review.rating - 0.2),
              wouldHireAgain: review.rating >= 4.5,
            },
          },
        },
      });
    }
  }
  console.log("✅ Reviews created");

  console.log("\n✨ Seed complete!");
  console.log("\nTest accounts:");
  console.log("  Admin:     admin@handyman.dev / Admin1234!");
  console.log("  Requester: john@example.com / Test1234!");
  console.log("  Requester: sarah@example.com / Test1234!");
  console.log("  Provider:  mike@example.com / Test1234!");
  console.log("  Provider:  james@example.com / Test1234!");
  console.log("  Provider:  thandi@example.com / Test1234!");
  console.log("  Provider:  sipho@example.com / Test1234!");
  console.log("  Provider:  nomsa@example.com / Test1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
