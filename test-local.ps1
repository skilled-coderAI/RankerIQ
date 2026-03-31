$ErrorActionPreference = "Continue"
$backend = "http://localhost:8080"
$pass = 0
$fail = 0

function Test-Endpoint {
    param([string]$Name, [scriptblock]$Block)
    Write-Host "`n--- $Name ---" -ForegroundColor Cyan
    try {
        $result = & $Block
        if ($result) {
            Write-Host "PASS" -ForegroundColor Green
            $script:pass++
        } else {
            Write-Host "FAIL (empty result)" -ForegroundColor Red
            $script:fail++
        }
    } catch {
        Write-Host "FAIL: $_" -ForegroundColor Red
        $script:fail++
    }
}

# 1. Health
Test-Endpoint "Health Check" {
    $r = Invoke-RestMethod -Uri "$backend/health"
    Write-Host "  Response: $r"
    $r -eq "ok"
}

# 2. Student Login
Test-Endpoint "Student Login" {
    $body = @{ email = "student@demo.com"; password = "demo1234" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$backend/api/auth/login" -Method Post -ContentType "application/json" -Body $body
    $script:studentToken = $r.token
    Write-Host "  User: $($r.user.name) | Role: $($r.user.role) | ID: $($r.user.id)"
    $script:studentId = $r.user.id
    $r.token.Length -gt 0
}

# 3. Parent Login
Test-Endpoint "Parent Login" {
    $body = @{ email = "parent@demo.com"; password = "demo1234" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$backend/api/auth/login" -Method Post -ContentType "application/json" -Body $body
    $script:parentToken = $r.token
    Write-Host "  User: $($r.user.name) | Role: $($r.user.role)"
    $r.token.Length -gt 0
}

# 4. Wrong Password
Test-Endpoint "Wrong Password Rejected" {
    $body = @{ email = "student@demo.com"; password = "wrong" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$backend/api/auth/login" -Method Post -ContentType "application/json" -Body $body
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 401
    }
}

# 5. Auth /me
Test-Endpoint "GET /api/auth/me (student)" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/auth/me" -Headers $headers
    Write-Host "  Email: $($r.email) | Grade: $($r.grade)"
    $r.email -eq "student@demo.com"
}

# 6. Student Profile
Test-Endpoint "GET /api/student/profile" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/student/profile" -Headers $headers
    Write-Host "  Streak: $($r.current_streak) | XP: $($r.xp) | Level: $($r.level) ($($r.level_title))"
    Write-Host "  Sessions: $($r.total_sessions) | Minutes: $($r.total_minutes) | Badges: $($r.badges.Count)"
    $r.name.Length -gt 0
}

# 7. Create Session
Test-Endpoint "POST /api/sessions (create)" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $body = @{ subject = "mathematics"; grade = 5; language = "hinglish" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$backend/api/sessions" -Method Post -ContentType "application/json" -Headers $headers -Body $body
    $script:sessionId = $r.id
    Write-Host "  Session ID: $($r.id) | Subject: $($r.subject) | Grade: $($r.grade)"
    $r.id.Length -gt 0
}

# 8. Get Active Session
Test-Endpoint "GET /api/sessions/active" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/sessions/active" -Headers $headers
    Write-Host "  Active session: $($r.id) | Messages: $($r.message_count)"
    $r.id -eq $script:sessionId
}

# 9. Chat (with session)
Test-Endpoint "POST /api/chat (with session_id)" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $body = @{
        messages = @(@{ role = "user"; content = "What are fractions?" })
        subject = "mathematics"
        grade = 5
        language = "hinglish"
        session_id = $script:sessionId
    } | ConvertTo-Json -Depth 3
    $r = Invoke-RestMethod -Uri "$backend/api/chat" -Method Post -ContentType "application/json" -Headers $headers -Body $body -TimeoutSec 60
    Write-Host "  Agent: $($r.agent) | Session: $($r.session_id)"
    Write-Host "  Response preview: $($r.message.Substring(0, [Math]::Min(120, $r.message.Length)))..."
    $r.message.Length -gt 0
}

# 10. Verify message persisted
Test-Endpoint "GET /api/sessions/active (messages persisted)" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/sessions/active" -Headers $headers
    Write-Host "  Messages in session: $($r.message_count) | Stored messages: $($r.messages.Count)"
    $r.messages.Count -ge 2
}

# 11. End Session
Test-Endpoint "POST /api/sessions/{id}/end" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/sessions/$($script:sessionId)/end" -Method Post -Headers $headers
    Write-Host "  Ended: $($r.ended)"
    $r.ended -eq $true
}

# 12. No active session after ending
Test-Endpoint "GET /api/sessions/active (none after end)" {
    $headers = @{ Authorization = "Bearer $($script:studentToken)" }
    $r = Invoke-WebRequest -Uri "$backend/api/sessions/active" -Headers $headers -UseBasicParsing
    $body = $r.Content.Trim()
    Write-Host "  Response body: $body"
    $body -eq "null" -or $body -eq "" -or $body -eq "{}"
}

# 13. Parent: Get Children
Test-Endpoint "GET /api/parent/children" {
    $headers = @{ Authorization = "Bearer $($script:parentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/parent/children" -Headers $headers
    Write-Host "  Children count: $($r.Count)"
    foreach ($c in $r) { Write-Host "    - $($c.name) | Grade $($c.grade) | $($c.board)" }
    $r.Count -ge 1
}

# 14. Parent: Child Stats
Test-Endpoint "GET /api/parent/child-stats/{id}" {
    $headers = @{ Authorization = "Bearer $($script:parentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/parent/child-stats/$($script:studentId)" -Headers $headers
    Write-Host "  Sessions: $($r.total_sessions) | Minutes: $($r.total_minutes)"
    Write-Host "  Streak: $($r.current_streak) | This week: $($r.sessions_this_week) sessions, $($r.minutes_this_week) min"
    Write-Host "  Avg understanding: $($r.avg_understanding) | Assessments: $($r.recent_assessments.Count)"
    $true
}

# 15. Parent: Topic Mastery
Test-Endpoint "GET /api/parent/topic-mastery/{id}" {
    $headers = @{ Authorization = "Bearer $($script:parentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/parent/topic-mastery/$($script:studentId)" -Headers $headers
    Write-Host "  Topics tracked: $($r.Count)"
    foreach ($t in $r) { Write-Host "    - $($t.subject)/$($t.topic): $($t.accuracy)% ($($t.strength))" }
    $true
}

# 16. Parent: Recent Sessions
Test-Endpoint "GET /api/parent/sessions/{id}" {
    $headers = @{ Authorization = "Bearer $($script:parentToken)" }
    $r = Invoke-RestMethod -Uri "$backend/api/parent/sessions/$($script:studentId)" -Headers $headers
    Write-Host "  Recent sessions: $($r.Count)"
    foreach ($s in $r) { Write-Host "    - $($s.subject) Grade $($s.grade) | $($s.message_count) msgs | $($s.duration_minutes) min" }
    $r.Count -ge 1
}

# 17. Unauthorized access rejected
Test-Endpoint "Unauthorized access rejected (no token)" {
    try {
        Invoke-RestMethod -Uri "$backend/api/student/profile"
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 401
    }
}

# 18. Signup new user
Test-Endpoint "POST /api/auth/signup (new student)" {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $body = @{
        name = "Test Student $ts"
        email = "test$ts@test.com"
        password = "testpass123"
        role = "student"
        grade = 8
        board = "ICSE"
    } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$backend/api/auth/signup" -Method Post -ContentType "application/json" -Body $body
    Write-Host "  Created: $($r.user.name) | ID: $($r.user.id)"
    $r.token.Length -gt 0
}

# 19. Duplicate email rejected
Test-Endpoint "Duplicate email rejected" {
    $body = @{ name = "Dup"; email = "student@demo.com"; password = "test"; role = "student" } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$backend/api/auth/signup" -Method Post -ContentType "application/json" -Body $body
        $false
    } catch {
        $_.Exception.Response.StatusCode.value__ -eq 409
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "  RESULTS: $pass PASSED / $fail FAILED / $($pass + $fail) TOTAL" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor Yellow
