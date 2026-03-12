#!/usr/bin/env bash

# Suporte PDV Frontend - Stop
# Uso: ./stop-frontend.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}⏹️  Parando Suporte PDV Frontend...${NC}"

LOG_DIR="./logs"
pid_file="$LOG_DIR/frontend.pid"

if [ -f $pid_file ]; then
    pid=$(cat $pid_file)
    if ps -p $pid > /dev/null 2>&1; then
        kill -15 $pid 2>/dev/null || true
        sleep 1
        ps -p $pid > /dev/null 2>&1 && kill -9 $pid 2>/dev/null || true
        echo -e "${GREEN}  ✓ Processo ${pid} terminado${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Processo ${pid} já não estava rodando${NC}"
    fi
    rm -f $pid_file
fi

# Garante que a porta 3000 está livre
port_pid=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$port_pid" ]; then
    echo -e "${YELLOW}  ⚠️  Matando processo na porta 3000 (PID: $port_pid)${NC}"
    kill -9 $port_pid 2>/dev/null || true
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}✗ Porta 3000 ainda está em uso${NC}"
else
    echo -e "${GREEN}✓ Porta 3000 livre${NC}"
fi

echo ""
echo -e "${GREEN}✅ Frontend parado.${NC}"
echo -e "${BLUE}💡 Para iniciar novamente: ${YELLOW}./start-frontend-dev.sh${NC}"
echo ""
