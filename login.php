<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  echo json_encode(["success" => false, "message" => "Method not allowed"]);
  exit();
}

// Read JSON body
$raw = file_get_contents("php://input");
$data = json_decode($raw);
if (!$data) {
  echo json_encode(["success" => false, "message" => "Invalid JSON body"]);
  exit();
}

$userInput = isset($data->username) ? trim($data->username) : '';
$password = isset($data->password) ? $data->password : '';

if ($userInput === '' || $password === '') {
  echo json_encode(["success" => false, "message" => "Missing username or password"]);
  exit();
}

$servername = "localhost";
$username_db = "root";
$dbpassword = "";
$dbname = "SmokeDetectiondb";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $conn = new mysqli($servername, $username_db, $dbpassword, $dbname);

  // Check if username is email or firstname
  // Try email first, then firstname
  $stmt = $conn->prepare("SELECT * FROM `User` WHERE `email` = ? LIMIT 1");
  $stmt->bind_param("s", $userInput);
  $stmt->execute();
  $result = $stmt->get_result();
  
  // If no email match, try firstname
  if ($result->num_rows === 0) {
    $stmt->close();
    $stmt = $conn->prepare("SELECT * FROM `User` WHERE `firstname` = ? LIMIT 1");
    $stmt->bind_param("s", $userInput);
    $stmt->execute();
    $result = $stmt->get_result();
  }
  
  if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    $stmt->close();
    $conn->close();
    exit();
  }

  $user = $result->fetch_assoc();
  
  // Verify password
  if (password_verify($password, $user['password'])) {
    // Password is correct, return user data (without password)
    unset($user['password']);
    echo json_encode([
      "success" => true, 
      "message" => "Login successful",
      "user" => $user
    ]);
  } else {
    echo json_encode(["success" => false, "message" => "Invalid password"]);
  }

  $stmt->close();
  $conn->close();
} catch (mysqli_sql_exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "DB error", "error" => $e->getMessage()]);
}
?>
