package com.pets.petcare.service;

import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

// @Service // Disabled - using MarketplaceSampleDataService instead
@RequiredArgsConstructor
@Slf4j
public class SampleDataService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final PetOwnerRepository petOwnerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing sample data...");
            createSampleData();
        }
    }

    private void createSampleData() {
        // Create sample users
        createUser("admin@petcare.com", "Admin User", User.Role.ADMIN);
        User vendor1 = createUser("vendor1@petcare.com", "Pet Supplies Co", User.Role.VENDOR);
        User vendor2 = createUser("vendor2@petcare.com", "Healthy Pets Store", User.Role.VENDOR);
        User customer1 = createUser("customer1@petcare.com", "John Doe", User.Role.OWNER);
        User customer2 = createUser("customer2@petcare.com", "Jane Smith", User.Role.OWNER);
        User vetUser = createUser("vet1@petcare.com", "Dr. Sarah Wilson", User.Role.VET);

        // Create pet owners
        PetOwner owner1 = createPetOwner(customer1);
        PetOwner owner2 = createPetOwner(customer2);

        // Create veterinarian
        Veterinarian vet = createVeterinarian(vetUser);

        // Create sample pets
        List<Pet> pets1 = createSamplePets(owner1);
        List<Pet> pets2 = createSamplePets(owner2);

        // Create sample products
        List<Product> products = createSampleProducts(vendor1, vendor2);

        // Create sample orders
        createSampleOrders(customer1, customer2, products);

        // Create sample appointments
        createSampleAppointments(vet, pets1.get(0), pets2.get(0));

        log.info("Sample data initialized successfully!");
    }

    private User createUser(String email, String name, User.Role role) {
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setRole(role);
        user.setIsVerified(true); // Added missing field
        user.setIsActive(true); // Added missing field
        user.setPhone("555-123-4567"); // Added missing field
        return userRepository.save(user);
    }

    private Veterinarian createVeterinarian(User vetUser) {
        Veterinarian vet = new Veterinarian();
        vet.setUser(vetUser);
        vet.setClinicName("Happy Pets Clinic");
        vet.setSpecialization("General Practice");
        vet.setClinicAddress("123 Pet Street, Pet City"); // Corrected method name
        vet.setAvailableForTeleconsult(true); // Corrected method name
        vet.setConsultationFee(75.00);
        return veterinarianRepository.save(vet);
    }

    private List<Product> createSampleProducts(User vendor1, User vendor2) {
        List<Product> products = Arrays.asList(
                createProduct("Premium Dog Food", "High-quality nutrition for adult dogs",
                        new BigDecimal("45.99"), 50, Product.Category.FOOD, "Royal Canine"),

                createProduct("Cat Scratching Post", "Durable sisal rope scratching post",
                        new BigDecimal("29.99"), 25, Product.Category.TOYS, "PetFun"),

                createProduct("Dog Vitamins", "Daily multivitamin supplements for dogs",
                        new BigDecimal("19.99"), 100, Product.Category.HEALTH, "VitaPet"),

                createProduct("Leather Dog Collar", "Genuine leather collar with brass buckle",
                        new BigDecimal("24.99"), 30, Product.Category.ACCESSORIES, "LeatherCraft"),

                createProduct("Pet Shampoo", "Gentle, hypoallergenic pet shampoo",
                        new BigDecimal("12.99"), 75, Product.Category.GROOMING, "CleanPaws"),

                createProduct("Interactive Puzzle Toy", "Mental stimulation toy for dogs",
                        new BigDecimal("18.99"), 40, Product.Category.TOYS, "BrainGames"),

                createProduct("First Aid Kit", "Complete pet first aid emergency kit",
                        new BigDecimal("39.99"), 20, Product.Category.HEALTH, "SafePet"),

                createProduct("Training Treats", "High-value training treats for dogs",
                        new BigDecimal("8.99"), 60, Product.Category.TRAINING, "GoodDog"));

        return productRepository.saveAll(products);
    }

    private Product createProduct(String title, String description,
            BigDecimal price, Integer stock, Product.Category category, String brand) {
        Product product = new Product();
        product.setTitle(title);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setCategory(category);
        product.setBrand(brand);
        product.setActive(true);
        product.setRating(4.0 + Math.random()); // Random rating between 4.0-5.0
        product.setReviewCount((int) (Math.random() * 50) + 10); // Random reviews 10-60
        return product;
    }

    private void createSampleOrders(User customer1, User customer2, List<Product> products) {
        // Order 1 - Completed
        Order order1 = new Order();
        order1.setOrderNumber("ORD-20240101120000-001");
        order1.setUser(customer1);
        order1.setTotalAmount(new BigDecimal("75.98"));
        order1.setSubtotal(new BigDecimal("70.98"));
        order1.setShippingCost(new BigDecimal("4.99"));
        order1.setTax(new BigDecimal("0.01"));
        order1.setStatus(Order.OrderStatus.DELIVERED);
        order1.setShippingName("John Doe");
        order1.setShippingAddress("123 Main St");
        order1.setShippingCity("Anytown");
        order1.setShippingState("CA");
        order1.setShippingZipCode("12345");
        order1.setShippingPhone("555-123-4567");
        order1.setPaymentMethod(Order.PaymentMethod.CREDIT_CARD);
        order1.setPaymentStatus(Order.PaymentStatus.PAID);
        order1.setPaymentTransactionId("pay_123456");
        orderRepository.save(order1);

        // Order 2 - Pending
        Order order2 = new Order();
        order2.setOrderNumber("ORD-20240101120001-002");
        order2.setUser(customer2);
        order2.setTotalAmount(new BigDecimal("44.98"));
        order2.setSubtotal(new BigDecimal("41.98"));
        order2.setShippingCost(new BigDecimal("2.99"));
        order2.setTax(new BigDecimal("0.01"));
        order2.setStatus(Order.OrderStatus.PENDING);
        order2.setShippingName("Jane Smith");
        order2.setShippingAddress("456 Oak Ave");
        order2.setShippingCity("Another City");
        order2.setShippingState("NY");
        order2.setShippingZipCode("67890");
        order2.setShippingPhone("555-987-6543");
        order2.setPaymentMethod(Order.PaymentMethod.PAYPAL);
        order2.setPaymentStatus(Order.PaymentStatus.PENDING);
        orderRepository.save(order2);

        // Order 3 - Shipped
        Order order3 = new Order();
        order3.setOrderNumber("ORD-20240101120002-003");
        order3.setUser(customer1);
        order3.setTotalAmount(new BigDecimal("32.99"));
        order3.setSubtotal(new BigDecimal("29.99"));
        order3.setShippingCost(new BigDecimal("2.99"));
        order3.setTax(new BigDecimal("0.01"));
        order3.setStatus(Order.OrderStatus.SHIPPED);
        order3.setShippingName("John Doe");
        order3.setShippingAddress("123 Main St");
        order3.setShippingCity("Anytown");
        order3.setShippingState("CA");
        order3.setShippingZipCode("12345");
        order3.setShippingPhone("555-123-4567");
        order3.setPaymentMethod(Order.PaymentMethod.CREDIT_CARD);
        order3.setPaymentStatus(Order.PaymentStatus.PAID);
        order3.setPaymentTransactionId("pay_789012");
        orderRepository.save(order3);

        log.info("Created {} sample orders", 3);
    }

    private void createSampleAppointments(Veterinarian vet, Pet pet1, Pet pet2) {
        // Get all pets in the system and create appointments for them
        List<Pet> allPets = petRepository.findAll();

        if (allPets.isEmpty()) {
            log.info("No pets found, skipping appointment creation");
            return;
        }

        // Create appointments for the first few pets
        for (int i = 0; i < Math.min(allPets.size(), 3); i++) {
            Pet pet = allPets.get(i);

            // Upcoming appointment
            Appointment appointment1 = new Appointment();
            appointment1.setPet(pet);
            appointment1.setVeterinarian(vet);
            appointment1.setAppointmentDate(LocalDateTime.now().plusDays(1 + i));
            appointment1.setType(Appointment.AppointmentType.TELECONSULT);
            appointment1.setStatus(Appointment.AppointmentStatus.CONFIRMED);
            appointment1.setReason("Regular checkup for " + pet.getName());
            appointment1.setMeetingLink("https://meet.google.com/new?authuser=0&hs=179&pli=1&ijlm=" + pet.getId());
            appointmentRepository.save(appointment1);

            // Today's appointment (only for first pet)
            if (i == 0) {
                Appointment appointment2 = new Appointment();
                appointment2.setPet(pet);
                appointment2.setVeterinarian(vet);
                appointment2.setAppointmentDate(LocalDateTime.now().plusHours(2));
                appointment2.setType(Appointment.AppointmentType.IN_CLINIC);
                appointment2.setStatus(Appointment.AppointmentStatus.CONFIRMED);
                appointment2.setReason("Vaccination for " + pet.getName());
                appointmentRepository.save(appointment2);
            }
        }

        log.info("Created sample appointments for {} pets", Math.min(allPets.size(), 3));
    }

    private PetOwner createPetOwner(User user) {
        PetOwner petOwner = new PetOwner();
        petOwner.setUser(user);
        petOwner.setAddress("123 Main St, Anytown, USA");
        petOwner.setPreferences("Prefers video consultations");
        petOwner.setEmergencyContact("555-123-4567");
        return petOwnerRepository.save(petOwner);
    }

    private List<Pet> createSamplePets(PetOwner owner) {
        Pet pet1 = new Pet();
        pet1.setName("Buddy");
        pet1.setSpecies("Dog");
        pet1.setBreed("Golden Retriever");
        pet1.setGender(Pet.Gender.MALE);
        pet1.setDateOfBirth(LocalDate.now().minusYears(3));
        pet1.setWeight(new BigDecimal("25.5"));
        pet1.setOwner(owner);
        petRepository.save(pet1);

        Pet pet2 = new Pet();
        pet2.setName("Whiskers");
        pet2.setSpecies("Cat");
        pet2.setBreed("Persian");
        pet2.setGender(Pet.Gender.FEMALE);
        pet2.setDateOfBirth(LocalDate.now().minusYears(2));
        pet2.setWeight(new BigDecimal("4.2"));
        pet2.setOwner(owner);
        petRepository.save(pet2);

        log.info("Created {} sample pets", 2);
        return Arrays.asList(pet1, pet2);
    }
}