import { TimelineItem } from "@/types/timeline";

export const DEMO_DATA: TimelineItem[] = [
    {
        label: "Computer Science Degree",
        category: "Education",
        start: "2015-09",
        end: "2019-06",
        description: "Bachelor of Science in Computer Science. Focused on Algorithms, Data Structures, and Web Development."
    },
    {
        label: "Junior Frontend Developer",
        category: "Work",
        start: "2019-07",
        end: "2021-02",
        description: "Developed responsive web applications using React and TypeScript. Collaborated with UX/UI designers to implement new features."
    },
    {
        label: "Open Source Contributor",
        category: "Project",
        start: "2020-03",
        end: "2021-05",
        description: "Contributed to various open-source libraries, improving documentation and fixing bugs in popular UI frameworks."
    },
    {
        label: "Senior Software Engineer",
        category: "Work",
        start: "2021-03",
        end: "", // Present
        description: "Leading the frontend team, architecting scalable solutions, and mentoring junior developers. specialized in performance optimization."
    },
    {
        label: "Tech Blog Launch",
        category: "Milestone",
        start: "2022-08",
        end: "2022-08",
        description: "Launched a personal tech blog sharing insights on React performance and state management, reaching 10k monthly readers."
    }
];
