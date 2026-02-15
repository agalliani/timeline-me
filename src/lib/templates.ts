import { TimelineItem } from "@/types/timeline";

export interface TimelineTemplate {
    id: string;
    name: string;
    description: string;
    items: TimelineItem[];
    colorMap?: Record<string, string>;
}

export const TEMPLATES: TimelineTemplate[] = [
    {
        id: "books-3-years",
        name: "Reading Journey (3 Years)",
        description: "A mix of quick reads and long-term projects.",
        colorMap: {
            "Sci-Fi": "#3b82f6", // Blue
            "Fantasy": "#8b5cf6", // Purple
            "Non-Fiction": "#10b981", // Emerald
            "Thriller": "#ef4444", // Red
            "Classic": "#f59e0b", // Amber
        },
        items: [
            // Long read spanning most of the timeline
            { start: "01/2021", end: "12/2023", label: "In Search of Lost Time", category: "Classic", description: "Marcel Proust. reading this massive 7-volume work alongside other books." },

            { start: "01/2021", end: "02/2021", label: "Dune", category: "Sci-Fi", description: "Frank Herbert. A masterpiece of world-building." },
            { start: "03/2021", end: "04/2021", label: "Project Hail Mary", category: "Sci-Fi", description: "Andy Weir. Incredible science-based survival story." },
            { start: "05/2021", end: "06/2021", label: "Atomic Habits", category: "Non-Fiction", description: "James Clear. Tiny changes, remarkable results." },
            { start: "08/2021", end: "09/2021", label: "The Silent Patient", category: "Thriller", description: "Alex Michaelides. A shocking psychological thriller." },
            { start: "11/2021", end: "12/2021", label: "Foundation", category: "Sci-Fi", description: "Isaac Asimov. The beginning of a galactic empire." },

            // Medium length series read together
            { start: "01/2022", end: "06/2022", label: "The Lord of the Rings", category: "Fantasy", description: "J.R.R. Tolkien. Re-reading the trilogy." },

            { start: "02/2022", end: "03/2022", label: "The Way of Kings", category: "Fantasy", description: "Brandon Sanderson. Epic fantasy at its finest." },
            { start: "04/2022", end: "05/2022", label: "Sapiens", category: "Non-Fiction", description: "Yuval Noah Harari. A brief history of humankind." },
            { start: "06/2022", end: "07/2022", label: "1984", category: "Classic", description: "George Orwell. Dystopian social science fiction." },
            { start: "09/2022", end: "10/2022", label: "Dark Matter", category: "Sci-Fi", description: "Blake Crouch. Mind-bending multiverse thriller." },
            { start: "12/2022", end: "01/2023", label: "Mistborn: The Final Empire", category: "Fantasy", description: "Brandon Sanderson. Unique magic system and heist plot." },
            { start: "02/2023", end: "03/2023", label: "Thinking, Fast and Slow", category: "Non-Fiction", description: "Daniel Kahneman. Understanding how we think." },
            { start: "05/2023", end: "06/2023", label: "The Three-Body Problem", category: "Sci-Fi", description: "Cixin Liu. Hard sci-fi dealing with first contact." },
            { start: "08/2023", end: "09/2023", label: "Gone Girl", category: "Thriller", description: "Gillian Flynn. marriage gone wrong." },
            { start: "11/2023", end: "12/2023", label: "Deep Work", category: "Non-Fiction", description: "Cal Newport. Rules for focused success." },
        ]
    },
    {
        id: "tv-series-5-years",
        name: "TV Series Tracker (5 Years)",
        description: "Tracking long-running shows interleaved with miniseries.",
        colorMap: {
            "Drama": "#ef4444",
            "Comedy": "#f59e0b",
            "Sci-Fi": "#3b82f6",
            "Fantasy": "#8b5cf6",
            "Documentary": "#10b981",
            "Anime": "#a855f7",
        },
        items: [
            // Long running weekly show
            { start: "01/2019", end: "12/2023", label: "One Piece", category: "Anime", description: "Watching weekly episodes of the pirate epic." },

            { start: "01/2019", end: "05/2019", label: "Game of Thrones (S8)", category: "Fantasy", description: "The controversial final season." },
            { start: "06/2019", end: "07/2019", label: "Chernobyl", category: "Drama", description: "Historical drama miniseries." },
            { start: "10/2019", end: "12/2019", label: "The Mandalorian (S1)", category: "Sci-Fi", description: "Star Wars live-action series." },
            { start: "03/2020", end: "04/2020", label: "Tiger King", category: "Documentary", description: "True crime documentary miniseries." },
            { start: "05/2020", end: "08/2020", label: "The Office (US) Rewatch", category: "Comedy", description: "Comfort binge during lockdown." },
            { start: "10/2020", end: "11/2020", label: "The Queen's Gambit", category: "Drama", description: "Chess prodigy miniseries." },
            { start: "01/2021", end: "03/2021", label: "WandaVision", category: "Sci-Fi", description: "Marvel cinematic universe series." },

            // Overlapping show
            { start: "09/2021", end: "05/2022", label: "Abbott Elementary (S1)", category: "Comedy", description: "Mockumentary sitcom." },

            { start: "09/2021", end: "10/2021", label: "Squid Game", category: "Drama", description: "South Korean survival drama." },
            { start: "01/2022", end: "02/2022", label: "Severance (S1)", category: "Sci-Fi", description: "Work-life balance thriller." },
            { start: "05/2022", end: "07/2022", label: "Stranger Things (S4)", category: "Sci-Fi", description: "Horror sci-fi drama." },
            { start: "08/2022", end: "10/2022", label: "House of the Dragon (S1)", category: "Fantasy", description: "Game of Thrones prequel." },
            { start: "01/2023", end: "03/2023", label: "The Last of Us", category: "Drama", description: "Post-apocalyptic drama." },
            { start: "04/2023", end: "06/2023", label: "Succession (S4)", category: "Drama", description: "Final season of the family saga." },
            { start: "09/2023", end: "11/2023", label: "Gen V", category: "Sci-Fi", description: "The Boys spinoff." },
        ]
    },
    {
        id: "professional-journey",
        name: "Professional Career",
        description: "Overlapping work experience, side projects, and education.",
        colorMap: {
            "Work": "#3b82f6",
            "Education": "#f59e0b",
            "Project": "#10b981",
            "Freelance": "#8b5cf6",
        },
        items: [
            { start: "09/2015", end: "07/2019", label: "B.Sc. Computer Science", category: "Education", description: "University of Technology. Graduated with honors." },

            // Overlap with university
            { start: "06/2018", end: "09/2018", label: "Software Intern", category: "Work", description: "Summer internship at TechCorp. Worked on frontend development." },

            { start: "08/2019", end: "12/2021", label: "Junior Developer", category: "Work", description: "Startup Inc. Full-stack development using React and Node.js." },

            // Overlap with junior dev job
            { start: "01/2020", end: "06/2020", label: "Personal Portfolio V1", category: "Project", description: "Designed and built first portfolio using HTML/CSS." },

            { start: "01/2022", end: "05/2024", label: "Software Engineer", category: "Work", description: "Enterprise Solutions Ltd. Led migration to microservices architecture." },

            // Long overlapping freelance work
            { start: "03/2022", end: null, label: "Freelance Consultant", category: "Freelance", description: "Providing web development services to local businesses on weekends." },

            { start: "06/2024", end: null, label: "Senior Engineer", category: "Work", description: "Big Tech Co. Focusing on scalable distributed systems." },
        ]
    }
];
