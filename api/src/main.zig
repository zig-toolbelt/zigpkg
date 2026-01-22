const std = @import("std");
const zap = @import("zap");
const pg = @import("pg");

var pool: *pg.Pool = undefined;

fn onRequest(r: zap.Request) !void {
    const path = r.path orelse "/";

    if (std.mem.eql(u8, path, "/")) {
        handleRoot(r);
    } else if (std.mem.eql(u8, path, "/health")) {
        handleHealth(r);
    } else if (std.mem.eql(u8, path, "/users")) {
        handleUsers(r);
    } else {
        r.setStatus(.not_found);
        r.sendBody("{\"error\": \"Not found\"}") catch return;
    }
}

fn handleRoot(r: zap.Request) void {
    r.setHeader("Content-Type", "text/html") catch return;
    r.sendBody("<html><body><h1>Zig API with PostgreSQL</h1><p>Endpoints: /health, /users</p></body></html>") catch return;
}

fn handleHealth(r: zap.Request) void {
    r.setHeader("Content-Type", "application/json") catch return;

    var result = pool.query("SELECT version()", .{}) catch {
        r.setStatus(.service_unavailable);
        r.sendBody("{\"status\": \"error\", \"message\": \"Database connection failed\"}") catch return;
        return;
    };
    defer result.deinit();

    if (result.next() catch null) |row| {
        const version = row.get([]const u8, 0);
        var buf: [512]u8 = undefined;
        const response = std.fmt.bufPrint(&buf, "{{\"status\": \"ok\", \"postgres_version\": \"{s}\"}}", .{version}) catch {
            r.sendBody("{\"status\": \"ok\"}") catch return;
            return;
        };
        r.sendBody(response) catch return;
    } else {
        r.sendBody("{\"status\": \"ok\"}") catch return;
    }
}

fn handleUsers(r: zap.Request) void {
    r.setHeader("Content-Type", "application/json") catch return;

    var result = pool.query("SELECT id, name, email FROM users ORDER BY id", .{}) catch {
        r.setStatus(.internal_server_error);
        r.sendBody("{\"error\": \"Query failed\"}") catch return;
        return;
    };
    defer result.deinit();

    var json = std.ArrayListUnmanaged(u8){};
    defer json.deinit(std.heap.page_allocator);

    const allocator = std.heap.page_allocator;
    json.appendSlice(allocator, "[") catch return;

    var first = true;
    while (result.next() catch null) |row| {
        if (!first) {
            json.appendSlice(allocator, ",") catch return;
        }
        first = false;

        const id = row.get(i32, 0);
        const name = row.get([]const u8, 1);
        const email = row.get([]const u8, 2);

        var buf: [256]u8 = undefined;
        const entry = std.fmt.bufPrint(&buf, "{{\"id\":{d},\"name\":\"{s}\",\"email\":\"{s}\"}}", .{ id, name, email }) catch continue;
        json.appendSlice(allocator, entry) catch return;
    }

    json.appendSlice(allocator, "]") catch return;
    r.sendBody(json.items) catch return;
}

fn initDatabase() !void {
    // Create users table if not exists
    _ = pool.exec(
        \\CREATE TABLE IF NOT EXISTS users (
        \\    id SERIAL PRIMARY KEY,
        \\    name VARCHAR(100) NOT NULL,
        \\    email VARCHAR(100) NOT NULL
        \\)
    , .{}) catch |err| {
        std.debug.print("Failed to create table: {}\n", .{err});
        return err;
    };

    // Insert sample data if table is empty
    var count_result = pool.query("SELECT COUNT(*) FROM users", .{}) catch return;
    defer count_result.deinit();

    if (count_result.next() catch null) |row| {
        const count = row.get(i64, 0);
        if (count == 0) {
            _ = pool.exec("INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')", .{}) catch {};
            _ = pool.exec("INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com')", .{}) catch {};
            std.debug.print("Inserted sample users\n", .{});
        }
    }
}

pub fn main() !void {
    // Initialize PostgreSQL connection pool
    pool = pg.Pool.init(std.heap.page_allocator, .{
        .size = 5,
        .timeout = 10 * std.time.ms_per_s,
        .connect = .{
            .host = "127.0.0.1",
            .port = 5433,
        },
        .auth = .{
            .username = "root",
            .password = "mysecretpassword",
            .database = "local",
        },
    }) catch |err| {
        std.debug.print("Failed to initialize database pool: {}\n", .{err});
        return err;
    };
    defer pool.deinit();

    std.debug.print("Connected to PostgreSQL\n", .{});

    // Initialize database schema
    initDatabase() catch |err| {
        std.debug.print("Failed to initialize database: {}\n", .{err});
    };

    // Start HTTP server
    var listener = zap.HttpListener.init(.{
        .port = 3000,
        .on_request = onRequest,
        .log = true,
        .max_clients = 100000,
    });
    try listener.listen();

    std.debug.print("Server listening on http://localhost:3000\n", .{});
    std.debug.print("Endpoints:\n", .{});
    std.debug.print("  GET /        - Home page\n", .{});
    std.debug.print("  GET /health  - Health check with DB version\n", .{});
    std.debug.print("  GET /users   - List users from DB\n", .{});

    zap.start(.{
        .threads = 2,
        .workers = 1,
    });
}
