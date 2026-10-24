"""
Sample resumes and job descriptions for instant testing and demonstration.
"""

SAMPLE_RESUME_TEXT = """
Alex Morgan
San Francisco, CA | (555) 342-8901 | alex.morgan@email.com | linkedin.com/in/alexmorgan-dev | github.com/alexmorgan

SUMMARY
Results-oriented Software Engineer with 4+ years of experience designing and implementing high-throughput web applications, RESTful APIs, and distributed systems. Passionate about machine learning infrastructure and developer productivity.

EDUCATION
University of California, Berkeley — Berkeley, CA
Bachelor of Science in Computer Science
Graduation: May 2021 | GPA: 3.82 / 4.0
Coursework: Distributed Systems, Operating Systems, Machine Learning, Database Management, Algorithms

EXPERIENCE
CloudScale Technologies — San Francisco, CA
Software Engineer | June 2021 – Present
- Designed and deployed scalable backend microservices using Python and FastAPI, handling over 15 million daily requests with sub-50ms p95 latency.
- Spearheaded the migration from a monolithic architecture to containerized services on Docker and Kubernetes, reducing server infrastructure costs by 28%.
- Integrated Redis caching layers and optimized PostgreSQL database queries, improving endpoint response times by 40%.
- Implemented CI/CD pipelines using GitHub Actions, cutting feature deployment cycles from 4 days to under 30 minutes.
- Collaborated in an Agile team of 8 engineers, participating in code reviews, design documentation, and sprint retrospectives.

Apex Innovations — San Jose, CA
Software Engineering Intern | June 2020 – August 2020
- Built full-stack dashboard modules using React, TypeScript, and Python Flask for internal metrics monitoring.
- Automated system health check alerts using Celery and Redis, identifying server outages 3x faster than manual monitoring.
- Wrote comprehensive unit and integration tests with PyTest, raising overall test coverage from 68% to 89%.

PROJECTS
SmartSearch AI Engine | Python, PyTorch, FastAPI, Docker | Jan 2023 – April 2023
- Built a semantic search and retrieval augmented generation (RAG) platform indexing 500k+ technical documents.
- Benchmarked vector search retrieval using FAISS and quantized open-weights models, achieving 94% top-5 retrieval accuracy.
- Containerized the full application with Docker Compose and published an open-source documentation demo with 400+ GitHub stars.

Distributed Task Queue | Go, Redis, Docker | Aug 2022 – Nov 2022
- Engineered an asynchronous task worker pool in Go supporting priority queuing, exponential retry backoff, and dead-letter queues.
- Handled peak throughput of 10,000 tasks/second with fault-tolerant recovery against worker crashes.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, Go, SQL, HTML/CSS
Frameworks & Libraries: FastAPI, Flask, React, Node.js, PyTorch, Pandas, SQLAlchemy
Developer Tools & DevOps: Git, Docker, Kubernetes, AWS (EC2, S3, RDS), GitHub Actions, Linux, Postman
Databases: PostgreSQL, Redis, MongoDB, SQLite
"""

SAMPLE_JOB_DESCRIPTIONS = {
    "ai_fullstack": {
        "title": "Senior AI & Full-Stack Engineer",
        "company": "NextGen AI Labs",
        "description": """
About the Role:
We are seeking a talented Senior AI & Full-Stack Engineer to architect next-generation AI-driven applications. You will work across the stack, integrating large language models (such as Gemma, Llama, and local LLM runners via Ollama) into responsive, high-performance web applications.

Responsibilities:
- Architect and maintain robust backend microservices using Python (FastAPI/Uvicorn) and RESTful API best practices.
- Build sleek, reactive user interfaces with modern frontend technologies (React / TypeScript / Vanilla JS / CSS).
- Integrate local and cloud LLMs for document processing, structured data extraction, and semantic understanding.
- Containerize and deploy services using Docker, Kubernetes, and automated CI/CD pipelines.
- Optimize database queries (PostgreSQL, Redis) for low-latency AI inference and high concurrent user loads.
- Ensure security, observability, and ATS / enterprise compliance standards.

Requirements:
- 3+ years experience in Python backend development with FastAPI, Flask, or Django.
- Experience integrating LLMs (Ollama, HuggingFace, OpenAI, or Gemma) into production workflows.
- Strong proficiency in modern front-end technologies (React, TypeScript, or modern web standards).
- Familiarity with Docker, Kubernetes, microservices architecture, and cloud environments (AWS/GCP).
- Deep understanding of data modeling, SQL/NoSQL databases, and caching strategies (Redis).
- Passion for clean code, automated testing (pytest), and developer experience.
"""
    },
    "backend_systems": {
        "title": "Senior Backend Systems Engineer",
        "company": "Veloce Cloud",
        "description": """
About the Role:
We are looking for a Backend Systems Engineer to build high-scale distributed systems and cloud infrastructure.

Key Responsibilities:
- Design fault-tolerant, event-driven architectures handling millions of daily events.
- Implement high-performance APIs and data streaming pipelines using Python, Go, and Redis.
- Drive DevOps and container orchestration best practices with Docker, Kubernetes, and Terraform.
- Monitor system reliability, implement SLOs/SLIs, and tune PostgreSQL database performance.

Required Qualifications:
- 4+ years of professional backend engineering experience.
- Mastery of Python, Go, or modern compiled languages.
- Strong experience with relational databases (PostgreSQL), index optimization, and distributed caching.
- Deep hands-on knowledge of Docker, Kubernetes, and CI/CD pipelines.
- Bachelor's in Computer Science or equivalent practical experience.
"""
    }
}
