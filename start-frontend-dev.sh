#!/usr/bin/env bash

# Suporte PDV Frontend - Desenvolvimento
# Uso: ./start-frontend-dev.sh

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Suporte PDV Frontend - Desenvolvimento      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado.${NC}"
    echo -e "${YELLOW}   Crie o arquivo com as variáveis de ambiente necessárias.${NC}"
    echo ""
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Executando npm install...${NC}"
    npm install
fi

LOG_DIR="./logs"
mkdir -p $LOG_DIR
LOG_FILE="$LOG_DIR/frontend.log"

# Para qualquer instância anterior
pid_file="$LOG_DIR/frontend.pid"
if [ -f $pid_file ]; then
    old_pid=$(cat $pid_file)
    if ps -p $old_pid > /dev/null 2>&1; then
        echo -e "${YELLOW}⏹️  Parando instância anterior (PID: $old_pid)...${NC}"
        kill -9 $old_pid 2>/dev/null || true
        sleep 1
    fi
    rm -f $pid_file
fi

# Libera porta 3000 se estiver em uso
port_pid=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$port_pid" ]; then
    echo -e "${YELLOW}⚠️  Liberando porta 3000 (PID: $port_pid)...${NC}"
    kill -9 $port_pid 2>/dev/null || true
    sleep 1
fi

echo -e "${YELLOW}🚀 Iniciando frontend em modo desenvolvimento...${NC}"
npm run dev > $LOG_FILE 2>&1 &
pid=$!
echo $pid > $pid_file

sleep 3

if ps -p $pid > /dev/null 2>&1; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✓ Frontend iniciado com sucesso!            ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  URL:    ${GREEN}http://localhost:3000${NC}"
    echo -e "  PID:    ${GREEN}$pid${NC}"
    echo -e "  Logs:   ${GREEN}$LOG_FILE${NC}"
    echo ""
    echo -e "${BLUE}💡 Comandos úteis:${NC}"
    echo -e "  • Logs em tempo real: ${YELLOW}tail -f $LOG_FILE${NC}"
    echo -e "  • Parar:              ${YELLOW}./stop-frontend.sh${NC}"
    echo -e "  • Status:             ${YELLOW}./status-frontend.sh${NC}"
else
    echo -e "${RED}❌ Falha ao iniciar o frontend. Verifique os logs:${NC}"
    echo -e "  ${YELLOW}cat $LOG_FILE${NC}"
    exit 1
fi
echo ""
