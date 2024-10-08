import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function loadJSON(filename) {
  const filePath = join(__dirname, "..", "src", "data", filename);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Load JSON data
    const usersData = await loadJSON("users.json");
    const hostsData = await loadJSON("hosts.json");
    const propertiesData = await loadJSON("properties.json");
    const amenitiesData = await loadJSON("amenities.json");
    const bookingsData = await loadJSON("bookings.json");
    const reviewsData = await loadJSON("reviews.json");

    // Extract arrays from the wrapper objects
    const users = usersData.users;
    const hosts = hostsData.hosts;
    const properties = propertiesData.properties;
    const amenities = amenitiesData.amenities;
    const bookings = bookingsData.bookings;
    const reviews = reviewsData.reviews;

    // Debug: Log the structure of the extracted data
    console.log("Data structure:", {
      users: {
        type: typeof users,
        isArray: Array.isArray(users),
        length: users?.length,
      },
      hosts: {
        type: typeof hosts,
        isArray: Array.isArray(hosts),
        length: hosts?.length,
      },
      properties: {
        type: typeof properties,
        isArray: Array.isArray(properties),
        length: properties?.length,
      },
      amenities: {
        type: typeof amenities,
        isArray: Array.isArray(amenities),
        length: amenities?.length,
      },
      bookings: {
        type: typeof bookings,
        isArray: Array.isArray(bookings),
        length: bookings?.length,
      },
      reviews: {
        type: typeof reviews,
        isArray: Array.isArray(reviews),
        length: reviews?.length,
      },
    });

    // Clear existing data
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.property.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.host.deleteMany();
    await prisma.user.deleteMany();

    console.log("Database cleared");

    // Create users
    if (Array.isArray(users)) {
      const createdUsers = await Promise.all(
        users.map((user) =>
          prisma.user.create({
            data: {
              id: user.id,
              username: user.username,
              password: user.password,
              name: user.name,
              email: user.email,
              phoneNumber: user.phoneNumber,
              pictureUrl: user.profilePicture,
            },
          })
        )
      );
      console.log(`Created ${createdUsers.length} users`);
    }

    // Create hosts
    if (Array.isArray(hosts)) {
      const createdHosts = await Promise.all(
        hosts.map((host) =>
          prisma.host.create({
            data: {
              id: host.id,
              username: host.username,
              password: host.password,
              name: host.name,
              email: host.email,
              phoneNumber: host.phoneNumber,
              pictureUrl: host.profilePicture,
              aboutMe: host.aboutMe,
            },
          })
        )
      );
      console.log(`Created ${createdHosts.length} hosts`);
    }

    // Create amenities
    if (Array.isArray(amenities)) {
      const createdAmenities = await Promise.all(
        amenities.map((amenity) =>
          prisma.amenity.create({
            data: {
              id: amenity.id,
              name: amenity.name,
            },
          })
        )
      );
      console.log(`Created ${createdAmenities.length} amenities`);
    }

    // Create properties
    if (Array.isArray(properties)) {
      const createdProperties = await Promise.all(
        properties.map((property) => {
          console.log("Processing property:", property.id);
          return prisma.property.create({
            data: {
              id: property.id,
              hostId: property.hostId,
              title: property.title,
              description: property.description,
              location: property.location,
              pricePerNight: property.pricePerNight,
              bedroomCount: property.bedroomCount,
              bathRoomCount: property.bathRoomCount,
              maxGuestCount: property.maxGuestCount,
              rating: property.rating,
              amenities: property.amenityIds
                ? {
                    connect: property.amenityIds.map((id) => ({ id })),
                  }
                : undefined,
              images: property.images
                ? {
                    create: property.images.map((image) => ({
                      url: image.url,
                    })),
                  }
                : undefined,
            },
          });
        })
      );
      console.log(`Created ${createdProperties.length} properties`);
    }

    // Create bookings
    if (Array.isArray(bookings)) {
      const createdBookings = await Promise.all(
        bookings.map((booking) =>
          prisma.booking.create({
            data: {
              id: booking.id,
              userId: booking.userId,
              propertyId: booking.propertyId,
              checkinDate: new Date(booking.checkinDate),
              checkoutDate: new Date(booking.checkoutDate),
              numberOfGuests: booking.numberOfGuests,
              totalPrice: booking.totalPrice,
              bookingStatus: booking.bookingStatus,
            },
          })
        )
      );
      console.log(`Created ${createdBookings.length} bookings`);
    }

    // Create reviews
    if (Array.isArray(reviews)) {
      const createdReviews = await Promise.all(
        reviews.map((review) =>
          prisma.review.create({
            data: {
              id: review.id,
              userId: review.userId,
              propertyId: review.propertyId,
              rating: review.rating,
              comment: review.comment,
            },
          })
        )
      );
      console.log(`Created ${createdReviews.length} reviews`);
    }

    console.log("Database has been seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.code === "P2002") {
      console.error(
        "Unique constraint failed. This might be due to duplicate IDs in your JSON data."
      );
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
