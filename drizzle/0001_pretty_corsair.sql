CREATE TABLE `bookingInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320),
	`eventType` enum('Wedding','Mehndi','Walima','Birthday','Corporate','Social Celebration','Other') NOT NULL,
	`eventDate` varchar(10) NOT NULL,
	`guestCount` int NOT NULL,
	`specialRequests` text,
	`status` enum('new','contacted','confirmed','declined','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookingInquiries_id` PRIMARY KEY(`id`)
);
