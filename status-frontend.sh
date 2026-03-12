#!/usr/bin/env bash

# Suporte PDV Frontend - Status
# Uso: ./status-frontend.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Suporte PDV Frontend - Status               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

LOG_DIR="./logs"
pid_file="$LOG_DIR/frontend.pid"

if [ -f $pid_file ]; then
    pid=$(cat $pid_file)
    if ps -p $pid > /dev/null 2>&1; then
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Frontend${NC}"
            echo -e "  ├─ Status: ${GREEN}RUNNING${NC}"
            echo -e "  ├─ PID: ${pid}"
            echo -e "  ├─ Porta: 3000"
            echo -e "  └─ URL: http://localhost:3000"

            if command -v curl &> /dev/null; then
                http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
                if [ "$http_code" = "200" ] || [ "$http_code" = "307" ] || [ "$http_code" = "302" ]; then
                    echo -e "       HTTP Check: ${GREEN}✓ OK (HTTP $http_code)${NC}"
                else
                    echo -e "       HTTP Check: ${YELLOW}⚠ HTTP $http_code${NC}"
                fi
            fi
        else
            echo -e "${YELLOW}⚠ Frontend${NC}"
            echo -e "  ├─ Status: ${YELLOW}STARTING${NC}"
            echo -e "  └─ PID $pid rodando, porta 3000 ainda não está escutando"
        fi
    else
        echo -e "${RED}✗ Frontend${NC}"
        echo -e "  ├─ Status: ${RED}STOPPED${NC}"
        echo -e "  └─ PID $pid não encontrado"
    fi
else
    port_pid=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$port_pid" ]; then
        echo -e "${YELLOW}⚠ Frontend${NC}"
        echo -e "  ├─ Status: ${YELLOW}UNKNOWN${NC}"
        echo -e "  ├─ PID: ${port_pid} (sem PID file)"
        echo -e "  └─ Porta 3000 em uso"
    else
        echo -e "${RED}✗ Frontend${NC}"
        echo -e "  ├─ Status: ${RED}STOPPED${NC}"
        echo -e "  └─ PID file não encontrado"
    fi
fi

echo ""

if [ -f "$LOG_DIR/frontend.log" ]; then
    log_size=$(du -sh "$LOG_DIR/frontend.log" 2>/dev/null | cut -f1)
    echo -e "${BLUE}📄 Log: ${YELLOW}$LOG_DIR/frontend.log${NC} (${log_size})"
    echo -e "${YELLOW}💡 Ver logs em tempo real: tail -f $LOG_DIR/frontend.log${NC}"
fi

echo ""
