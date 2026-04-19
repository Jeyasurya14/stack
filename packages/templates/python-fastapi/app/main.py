from fastapi import FastAPI

app = FastAPI(title="{{PROJECT_NAME}}")


@app.get("/")
def root():
    return {
        "app": "{{PROJECT_NAME}}",
        "framework": "fastapi",
        "db": "{{DB}}",
        "message": "Hello from Polystack!",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
