# Fix Duplicate Flyway Migrations Script
# This script renames duplicate migration files to avoid Flyway conflicts

Write-Host "🔧 Fixing Duplicate Flyway Migrations..." -ForegroundColor Cyan
Write-Host ""

$migrationPath = "petcare\src\main\resources\db\migration"

# Check if migration directory exists
if (-not (Test-Path $migrationPath)) {
    Write-Host "❌ Migration directory not found: $migrationPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Migration directory: $migrationPath" -ForegroundColor Green
Write-Host ""

# Duplicate V11 files
$v11_1 = Join-Path $migrationPath "V11__Emergency_Status_Fix.sql"
$v11_2 = Join-Path $migrationPath "V11__Fix_OrderItems_Price_Column.sql"

# Duplicate V20 files
$v20_1 = Join-Path $migrationPath "V20__Fix_All_Schema_Issues.sql"
$v20_2 = Join-Path $migrationPath "V20__Fix_Orders_Table_Ultimate.sql"

# Fix V11 duplicates
Write-Host "🔍 Checking V11 duplicates..." -ForegroundColor Yellow
if ((Test-Path $v11_1) -and (Test-Path $v11_2)) {
    Write-Host "  Found duplicate V11 files" -ForegroundColor Yellow
    $newName = Join-Path $migrationPath "V16__Fix_OrderItems_Price_Column.sql"
    
    if (Test-Path $newName) {
        Write-Host "  ⚠️  V16 already exists, deleting duplicate instead" -ForegroundColor Yellow
        Remove-Item $v11_2
        Write-Host "  ✅ Deleted: V11__Fix_OrderItems_Price_Column.sql" -ForegroundColor Green
    } else {
        Rename-Item $v11_2 $newName
        Write-Host "  ✅ Renamed: V11__Fix_OrderItems_Price_Column.sql → V16__Fix_OrderItems_Price_Column.sql" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ No V11 duplicates found" -ForegroundColor Green
}

Write-Host ""

# Fix V20 duplicates
Write-Host "🔍 Checking V20 duplicates..." -ForegroundColor Yellow
if ((Test-Path $v20_1) -and (Test-Path $v20_2)) {
    Write-Host "  Found duplicate V20 files" -ForegroundColor Yellow
    $newName = Join-Path $migrationPath "V22__Fix_Orders_Table_Ultimate.sql"
    
    if (Test-Path $newName) {
        Write-Host "  ⚠️  V22 already exists, deleting duplicate instead" -ForegroundColor Yellow
        Remove-Item $v20_2
        Write-Host "  ✅ Deleted: V20__Fix_Orders_Table_Ultimate.sql" -ForegroundColor Green
    } else {
        Rename-Item $v20_2 $newName
        Write-Host "  ✅ Renamed: V20__Fix_Orders_Table_Ultimate.sql → V22__Fix_Orders_Table_Ultimate.sql" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ No V20 duplicates found" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Migration cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review the changes" -ForegroundColor White
Write-Host "  2. Commit the changes: git add . && git commit -m 'Fix duplicate Flyway migrations'" -ForegroundColor White
Write-Host "  3. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host ""
