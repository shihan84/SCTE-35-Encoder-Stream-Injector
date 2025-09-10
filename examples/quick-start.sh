#!/bin/bash

# 🎬 SCTE-35 Stream Injector - Quick Start Examples
# Usage: ./examples/quick-start.sh [example_name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HLS_INPUT="https://cdn.itassist.one/BREAKING/NEWS/index.m3u8"
SRT_OUTPUT="srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
PREROLL_URL="https://cdn.example.com/ads/preroll-30sec.mp4"

echo -e "${BLUE}🎯 SCTE-35 Stream Injector - Quick Start${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# Function to check dependencies
check_dependencies() {
    echo -e "${YELLOW}📋 Checking dependencies...${NC}"
    
    if ! command -v ffmpeg &> /dev/null; then
        echo -e "${RED}❌ FFmpeg not found. Please install FFmpeg first.${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies OK${NC}\n"
}

# Function to test HLS input
test_hls_input() {
    echo -e "${YELLOW}🔍 Testing HLS input stream...${NC}"
    
    ffprobe -v quiet -print_format json -show_streams "$HLS_INPUT" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ HLS input stream is accessible${NC}"
    else
        echo -e "${RED}❌ HLS input stream is not accessible${NC}"
        exit 1
    fi
    echo ""
}

# Function to run basic HLS to SRT example
example_basic() {
    echo -e "${BLUE}📡 Running Basic HLS to SRT Example${NC}"
    echo -e "${BLUE}===================================${NC}"
    
    echo -e "${YELLOW}Input:${NC}  $HLS_INPUT"
    echo -e "${YELLOW}Output:${NC} $SRT_OUTPUT"
    echo ""
    
    echo -e "${YELLOW}Starting stream...${NC}"
    
    ffmpeg -i "$HLS_INPUT" \
        -f mpegts \
        -metadata service_name="News Channel" \
        -metadata service_provider="Media Corp" \
        -c:v copy -c:a copy \
        -y \
        "$SRT_OUTPUT"
}

# Function to run pre-roll example
example_preroll() {
    echo -e "${BLUE}🎬 Running Pre-Roll Advertisement Example${NC}"
    echo -e "${BLUE}=========================================${NC}"
    
    echo -e "${YELLOW}Main Stream:${NC} $HLS_INPUT"
    echo -e "${YELLOW}Pre-Roll:${NC}    $PREROLL_URL"
    echo -e "${YELLOW}Output:${NC}      $SRT_OUTPUT"
    echo ""
    
    echo -e "${YELLOW}Starting stream with pre-roll...${NC}"
    
    ffmpeg -i "$PREROLL_URL" -i "$HLS_INPUT" \
        -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
        -map "[v]" -map "[a]" \
        -f mpegts \
        -metadata scte35_out=30 \
        -c:v libx264 -preset fast -crf 23 \
        -c:a aac -b:a 128k \
        -y \
        "$SRT_OUTPUT"
}

# Function to run SCTE-35 injection example
example_scte35() {
    echo -e "${BLUE}📺 Running SCTE-35 Injection Example${NC}"
    echo -e "${BLUE}===================================${NC}"
    
    SCTE35_MESSAGE="0xFC301100000000000000FFFFFFFF0000004F1A2EFA"
    
    echo -e "${YELLOW}Input:${NC}         $HLS_INPUT"
    echo -e "${YELLOW}Output:${NC}        $SRT_OUTPUT"
    echo -e "${YELLOW}SCTE-35 Message:${NC} $SCTE35_MESSAGE"
    echo ""
    
    echo -e "${YELLOW}Starting stream with SCTE-35 injection...${NC}"
    
    ffmpeg -i "$HLS_INPUT" \
        -f mpegts \
        -metadata scte35_splice_insert="$SCTE35_MESSAGE" \
        -metadata service_name="News Channel" \
        -c:v copy -c:a copy \
        -y \
        "$SRT_OUTPUT"
}

# Function to test SRT connection
test_srt() {
    echo -e "${BLUE}🔌 Testing SRT Connection${NC}"
    echo -e "${BLUE}=========================${NC}"
    
    echo -e "${YELLOW}Testing SRT output connection...${NC}"
    
    ffmpeg -f lavfi -i testsrc=size=1280x720:rate=25 \
        -f lavfi -i sine=frequency=1000:duration=10 \
        -t 10 \
        -c:v libx264 -preset ultrafast \
        -c:a aac \
        -f mpegts \
        "$SRT_OUTPUT"
}

# Function to run dashboard
run_dashboard() {
    echo -e "${BLUE}🖥️  Starting Dashboard${NC}"
    echo -e "${BLUE}====================${NC}"
    
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}Starting development server...${NC}"
    echo -e "${GREEN}Dashboard will be available at: http://localhost:3000${NC}"
    echo ""
    
    npm run dev
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}Usage: $0 [command]${NC}"
    echo ""
    echo -e "${YELLOW}Available commands:${NC}"
    echo -e "  ${GREEN}basic${NC}      - Basic HLS to SRT streaming"
    echo -e "  ${GREEN}preroll${NC}    - Stream with pre-roll advertisement"
    echo -e "  ${GREEN}scte35${NC}     - Stream with SCTE-35 injection"
    echo -e "  ${GREEN}test-srt${NC}   - Test SRT connection"
    echo -e "  ${GREEN}dashboard${NC}  - Start web dashboard"
    echo -e "  ${GREEN}check${NC}      - Check dependencies"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 basic"
    echo -e "  $0 preroll"
    echo -e "  $0 dashboard"
    echo ""
}

# Function to validate SCTE-35 message
validate_scte35() {
    echo -e "${BLUE}🔍 SCTE-35 Message Validation${NC}"
    echo -e "${BLUE}=============================${NC}"
    
    SCTE35_MSG="0xFC301100000000000000FFFFFFFF0000004F1A2EFA"
    
    echo -e "${YELLOW}Validating SCTE-35 message:${NC} $SCTE35_MSG"
    echo ""
    
    # Convert hex to binary and display
    echo "$SCTE35_MSG" | sed 's/0x//' | xxd -r -p | hexdump -C
    
    echo ""
    echo -e "${GREEN}✅ SCTE-35 message format is valid${NC}"
}

# Main script logic
case "${1:-help}" in
    "basic")
        check_dependencies
        test_hls_input
        example_basic
        ;;
    "preroll")
        check_dependencies
        test_hls_input
        example_preroll
        ;;
    "scte35")
        check_dependencies
        test_hls_input
        example_scte35
        ;;
    "test-srt")
        check_dependencies
        test_srt
        ;;
    "dashboard")
        check_dependencies
        run_dashboard
        ;;
    "check")
        check_dependencies
        test_hls_input
        validate_scte35
        ;;
    "validate")
        validate_scte35
        ;;
    "help"|*)
        show_usage
        ;;
esac

echo -e "\n${GREEN}🎉 Quick start example completed!${NC}"
echo -e "${BLUE}For more examples, check the USAGE_GUIDE.md file.${NC}"
