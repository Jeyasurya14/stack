require "sinatra"
require "json"

set :bind, "0.0.0.0"
set :port, 4567

get "/" do
  content_type :json
  {
    app: "{{PROJECT_NAME}}",
    framework: "sinatra",
    db: "{{DB}}",
    message: "Hello from Polystack!"
  }.to_json
end

get "/health" do
  content_type :json
  { status: "ok" }.to_json
end
