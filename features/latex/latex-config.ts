export const latexTemplates = {
  "Software Engineer": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.7in]{geometry}
\usepackage{enumitem}
\begin{document}
\begin{center}
{\LARGE Alex Morgan}\\
alex@example.com | github.com/alex | linkedin.com/in/alex
\end{center}
\section*{Summary}
Full-stack engineer focused on reliable systems, product velocity, and measurable business outcomes.
\section*{Experience}
\textbf{Senior Software Engineer} \hfill 2022--Present
\begin{itemize}[leftmargin=*]
\item Improved API latency by 38\% by redesigning caching and database access patterns.
\item Led migration to Kubernetes for services handling 2M monthly requests.
\end{itemize}
\section*{Skills}
Next.js, TypeScript, MongoDB, Prisma, Kubernetes, observability
\end{document}`,
  "Research Resume": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.75in]{geometry}
\begin{document}
\begin{center}
{\LARGE Research Candidate}\\
research@example.com | Google Scholar | ORCID
\end{center}
\section*{Research Interests}
Human-centered AI, document intelligence, information retrieval, and evaluation systems.
\section*{Publications}
\begin{itemize}
\item First Author, "Evaluating Resume Optimization Systems", 2026.
\end{itemize}
\section*{Projects}
Built reproducible experiments for ranking job-resume alignment methods.
\end{document}`,
  "Academic CV": String.raw`\documentclass[11pt]{article}
\usepackage[margin=0.8in]{geometry}
\begin{document}
\begin{center}
{\LARGE Academic CV}\\
department@example.edu | University Department
\end{center}
\section*{Education}
Ph.D. Candidate, Computer Science \hfill 2026
\section*{Teaching}
\begin{itemize}
\item Teaching Assistant, Data Structures and Algorithms.
\end{itemize}
\section*{Awards}
Graduate Research Fellowship, Department Research Award.
\end{document}`,
  "Corporate Resume": String.raw`\documentclass[10pt]{article}
\usepackage[margin=0.7in]{geometry}
\begin{document}
\begin{center}
{\LARGE Corporate Leader}\\
leader@example.com | New York, NY
\end{center}
\section*{Executive Summary}
Operations and product leader with experience scaling teams, revenue operations, and enterprise delivery.
\section*{Leadership Experience}
\textbf{Director of Operations} \hfill 2020--Present
\begin{itemize}
\item Reduced operating costs by 18\% while improving customer response SLAs.
\end{itemize}
\end{document}`
};

export const latexSnippets = [
  { label: "Section", value: "\\section*{New Section}\n" },
  { label: "Bullet", value: "\\begin{itemize}\n\\item Improved X by Y\\% through Z.\n\\end{itemize}\n" },
  { label: "Role", value: "\\textbf{Job Title} \\hfill 2024--Present\n" }
];
