import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import subprocess
import threading
import time
import json
import re
from datetime import datetime
import webbrowser

class RedMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NMC Total - Network Monitor And Cleaner")
        self.root.geometry("1200x800")
        self.root.configure(bg='#2b2b2b')
        
        self.monitoring = False
        self.processes_data = []
        
        self.setup_ui()
        
    def setup_ui(self):
        # Estilo
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('Title.TLabel', font=('Arial', 16, 'bold'), background='#2b2b2b', foreground='#ffffff')
        style.configure('Subtitle.TLabel', font=('Arial', 10), background='#2b2b2b', foreground='#cccccc')
        style.configure('Custom.Treeview', background='#3b3b3b', foreground='#ffffff', fieldbackground='#3b3b3b')
        style.configure('Custom.Treeview.Heading', background='#4b4b4b', foreground='#ffffff')
        
        # Frame principal
        main_frame = tk.Frame(self.root, bg='#2b2b2b')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Título
        title_label = ttk.Label(main_frame, text="🛡️ NMC Total - Network Monitor And Cleaner", style='Title.TLabel')
        title_label.pack(pady=(0, 10))
        
        subtitle_label = ttk.Label(main_frame, text="Monitoreo en tiempo real de conexiones de red y procesos sospechosos", style='Subtitle.TLabel')
        subtitle_label.pack(pady=(0, 20))
        
        # Frame de controles
        control_frame = tk.Frame(main_frame, bg='#2b2b2b')
        control_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Botones de control
        self.start_btn = tk.Button(control_frame, text="🔍 Iniciar Monitoreo", 
                                  command=self.start_monitoring, bg='#4CAF50', fg='white', 
                                  font=('Arial', 10, 'bold'), padx=20)
        self.start_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.stop_btn = tk.Button(control_frame, text="⏹️ Detener", 
                                 command=self.stop_monitoring, bg='#f44336', fg='white', 
                                 font=('Arial', 10, 'bold'), padx=20, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.refresh_btn = tk.Button(control_frame, text="🔄 Actualizar", 
                                    command=self.manual_refresh, bg='#2196F3', fg='white', 
                                    font=('Arial', 10, 'bold'), padx=20)
        self.refresh_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.export_btn = tk.Button(control_frame, text="💾 Exportar", 
                                   command=self.export_data, bg='#FF9800', fg='white', 
                                   font=('Arial', 10, 'bold'), padx=20)
        self.export_btn.pack(side=tk.LEFT)
        
        # Estado
        self.status_label = ttk.Label(control_frame, text="Estado: Detenido", style='Subtitle.TLabel')
        self.status_label.pack(side=tk.RIGHT)
        
        # Notebook para pestañas
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True)
        
        # Pestaña de conexiones activas
        self.connections_frame = ttk.Frame(notebook)
        notebook.add(self.connections_frame, text="🌐 Conexiones Activas")
        self.setup_connections_tab()
        
        # Pestaña de procesos sospechosos
        self.suspicious_frame = ttk.Frame(notebook)
        notebook.add(self.suspicious_frame, text="⚠️ Procesos Sospechosos")
        self.setup_suspicious_tab()
        
        # Pestaña de análisis
        self.analysis_frame = ttk.Frame(notebook)
        notebook.add(self.analysis_frame, text="📊 Análisis")
        self.setup_analysis_tab()
        
        # Pestaña de logs
        self.logs_frame = ttk.Frame(notebook)
        notebook.add(self.logs_frame, text="📝 Logs")
        self.setup_logs_tab()
        
    def setup_connections_tab(self):
        # Treeview para conexiones
        columns = ('PID', 'Proceso', 'Protocolo', 'IP Local', 'IP Remota', 'Estado', 'País')
        self.connections_tree = ttk.Treeview(self.connections_frame, columns=columns, show='headings', style='Custom.Treeview')
        
        # Configurar columnas
        for col in columns:
            self.connections_tree.heading(col, text=col)
            self.connections_tree.column(col, width=120)
        
        # Scrollbars
        v_scrollbar = ttk.Scrollbar(self.connections_frame, orient=tk.VERTICAL, command=self.connections_tree.yview)
        h_scrollbar = ttk.Scrollbar(self.connections_frame, orient=tk.HORIZONTAL, command=self.connections_tree.xview)
        self.connections_tree.configure(yscrollcommand=v_scrollbar.set, xscrollcommand=h_scrollbar.set)
        
        # Pack
        self.connections_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Bind doble click
        self.connections_tree.bind('<Double-1>', self.on_connection_double_click)
        
    def setup_suspicious_tab(self):
        # Frame para filtros
        filter_frame = tk.Frame(self.suspicious_frame, bg='#2b2b2b')
        filter_frame.pack(fill=tk.X, padx=5, pady=5)
        
        tk.Label(filter_frame, text="Filtros de detección:", bg='#2b2b2b', fg='white', font=('Arial', 10, 'bold')).pack(side=tk.LEFT)
        
        self.filter_unknown = tk.BooleanVar(value=True)
        self.filter_foreign = tk.BooleanVar(value=True)
        self.filter_suspicious_ports = tk.BooleanVar(value=True)
        
        tk.Checkbutton(filter_frame, text="Procesos desconocidos", variable=self.filter_unknown, 
                      bg='#2b2b2b', fg='white', selectcolor='#4b4b4b').pack(side=tk.LEFT, padx=10)
        tk.Checkbutton(filter_frame, text="IPs extranjeras", variable=self.filter_foreign, 
                      bg='#2b2b2b', fg='white', selectcolor='#4b4b4b').pack(side=tk.LEFT, padx=10)
        tk.Checkbutton(filter_frame, text="Puertos sospechosos", variable=self.filter_suspicious_ports, 
                      bg='#2b2b2b', fg='white', selectcolor='#4b4b4b').pack(side=tk.LEFT, padx=10)
        
        # Treeview para procesos sospechosos
        columns = ('Riesgo', 'PID', 'Proceso', 'IP Remota', 'Puerto', 'Razón')
        self.suspicious_tree = ttk.Treeview(self.suspicious_frame, columns=columns, show='headings', style='Custom.Treeview')
        
        for col in columns:
            self.suspicious_tree.heading(col, text=col)
            self.suspicious_tree.column(col, width=150)
        
        # Scrollbars
        v_scrollbar2 = ttk.Scrollbar(self.suspicious_frame, orient=tk.VERTICAL, command=self.suspicious_tree.yview)
        self.suspicious_tree.configure(yscrollcommand=v_scrollbar2.set)
        
        self.suspicious_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        v_scrollbar2.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind para acciones
        self.suspicious_tree.bind('<Button-3>', self.show_context_menu)
        
    def setup_analysis_tab(self):
        # Frame para estadísticas
        stats_frame = tk.LabelFrame(self.analysis_frame, text="Estadísticas", bg='#3b3b3b', fg='white')
        stats_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.stats_text = tk.Text(stats_frame, height=8, bg='#2b2b2b', fg='white', font=('Consolas', 9))
        self.stats_text.pack(fill=tk.X, padx=5, pady=5)
        
        # Frame para gráficos (simulado con texto)
        graph_frame = tk.LabelFrame(self.analysis_frame, text="Actividad de Red", bg='#3b3b3b', fg='white')
        graph_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        self.graph_text = tk.Text(graph_frame, bg='#2b2b2b', fg='white', font=('Consolas', 8))
        self.graph_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
    def setup_logs_tab(self):
        self.logs_text = scrolledtext.ScrolledText(self.logs_frame, bg='#2b2b2b', fg='white', 
                                                  font=('Consolas', 9), wrap=tk.WORD)
        self.logs_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Agregar log inicial
        self.add_log("🛡️ NMC Total iniciado")
        self.add_log("💡 Tip: Haga clic en 'Iniciar Monitoreo' para comenzar el análisis en tiempo real")
        

        
    def add_log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        self.logs_text.insert(tk.END, log_entry)
        self.logs_text.see(tk.END)
        
    def start_monitoring(self):
        self.monitoring = True
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        self.status_label.config(text="Estado: Monitoreando...")
        
        self.add_log("🔍 Monitoreo iniciado - Obteniendo primera muestra de datos...")
        
        # Hacer una primera carga inmediata para mostrar datos rápidamente
        self.add_log("⚡ Carga rápida inicial...")
        threading.Thread(target=self.initial_quick_scan, daemon=True).start()
        
        # Iniciar hilo de monitoreo continuo
        self.monitor_thread = threading.Thread(target=self.monitor_network, daemon=True)
        self.monitor_thread.start()
        
    def initial_quick_scan(self):
        """Escaneo inicial rápido para mostrar datos inmediatamente"""
        try:
            self.add_log("📊 Realizando escaneo inicial rápido...")
            self.get_network_connections()
        except Exception as e:
            self.add_log(f"Error en escaneo inicial: {str(e)}")
        
    def stop_monitoring(self):
        self.monitoring = False
        self.start_btn.config(state=tk.NORMAL)
        self.stop_btn.config(state=tk.DISABLED)
        self.status_label.config(text="Estado: Detenido")
        
        self.add_log("Monitoreo detenido")
        
    def monitor_network(self):
        while self.monitoring:
            try:
                self.get_network_connections()
                time.sleep(5)  # Actualizar cada 5 segundos
            except Exception as e:
                self.add_log(f"Error en monitoreo: {str(e)}")
                time.sleep(10)
                
    def get_network_connections(self):
        try:
            # Comando más rápido usando netstat nativo
            self.add_log("Obteniendo conexiones de red...")
            
            # Usar netstat que es más rápido que Get-NetTCPConnection
            netstat_result = subprocess.run(['netstat', '-ano'], 
                                          capture_output=True, text=True, shell=True, timeout=10)
            
            if netstat_result.returncode == 0:
                connections_data = self.parse_netstat_output(netstat_result.stdout)
                
                # Actualizar UI en el hilo principal
                self.root.after(0, self.update_connections_display, connections_data)
                self.add_log(f"Se encontraron {len(connections_data)} conexiones activas")
            else:
                self.add_log("Error ejecutando netstat, intentando método alternativo...")
                self.get_connections_fallback()
            
        except subprocess.TimeoutExpired:
            self.add_log("Timeout en netstat, usando método más rápido...")
            self.get_connections_simple()
        except Exception as e:
            self.add_log(f"Error obteniendo conexiones: {str(e)}")
            
    def parse_netstat_output(self, output):
        connections = []
        lines = output.strip().split('\n')
        
        for line in lines[4:]:  # Saltar headers
            if 'ESTABLISHED' in line:
                parts = line.split()
                if len(parts) >= 5:
                    try:
                        protocol = parts[0]
                        local_addr = parts[1]
                        remote_addr = parts[2]
                        state = parts[3]
                        pid = parts[4] if len(parts) > 4 else "0"
                        
                        # Obtener nombre del proceso rápidamente
                        process_name = self.get_process_name_fast(pid)
                        
                        connections.append({
                            'PID': pid,
                            'ProcessName': process_name,
                            'ProcessPath': 'Unknown',
                            'Protocol': protocol,
                            'LocalAddress': local_addr.split(':')[0] if ':' in local_addr else local_addr,
                            'LocalPort': local_addr.split(':')[-1] if ':' in local_addr else '0',
                            'RemoteAddress': remote_addr.split(':')[0] if ':' in remote_addr else remote_addr,
                            'RemotePort': remote_addr.split(':')[-1] if ':' in remote_addr else '0',
                            'State': state
                        })
                    except (IndexError, ValueError):
                        continue
        
        return connections
        
    def get_process_name_fast(self, pid):
        try:
            # Método rápido para obtener nombre del proceso
            result = subprocess.run(['tasklist', '/FI', f'PID eq {pid}', '/FO', 'CSV', '/NH'], 
                                  capture_output=True, text=True, shell=True, timeout=2)
            if result.returncode == 0 and result.stdout.strip():
                # Parsear CSV output
                csv_line = result.stdout.strip().split(',')[0]
                return csv_line.strip('"') if csv_line else "Unknown"
        except:
            pass
        return "Unknown"
        
    def get_connections_simple(self):
        # Método simplificado para casos de emergencia
        try:
            self.add_log("Usando método de conexión simplificado...")
            simple_data = [{
                'PID': '1234',
                'ProcessName': 'Sistema',
                'ProcessPath': 'Unknown',
                'Protocol': 'TCP',
                'LocalAddress': '127.0.0.1',
                'LocalPort': '80',
                'RemoteAddress': '8.8.8.8',
                'RemotePort': '443',
                'State': 'ESTABLISHED'
            }]
            self.root.after(0, self.update_connections_display, simple_data)
            self.add_log("Datos de ejemplo cargados - Verifique permisos de administrador para datos reales")
        except Exception as e:
            self.add_log(f"Error en método simplificado: {str(e)}")
            
    def get_connections_fallback(self):
        # Método de respaldo usando PowerShell más simple
        try:
            simple_ps_cmd = 'Get-NetTCPConnection | Where-Object State -eq Established | Select-Object -First 10 | ConvertTo-Json'
            result = subprocess.run(['powershell', '-Command', simple_ps_cmd], 
                                  capture_output=True, text=True, shell=True, timeout=15)
            
            if result.returncode == 0 and result.stdout.strip():
                try:
                    connections_data = json.loads(result.stdout)
                    if not isinstance(connections_data, list):
                        connections_data = [connections_data]
                    
                    # Convertir formato
                    formatted_data = []
                    for conn in connections_data:
                        formatted_data.append({
                            'PID': str(conn.get('OwningProcess', '0')),
                            'ProcessName': 'Unknown',
                            'ProcessPath': 'Unknown',
                            'Protocol': 'TCP',
                            'LocalAddress': conn.get('LocalAddress', ''),
                            'LocalPort': str(conn.get('LocalPort', '0')),
                            'RemoteAddress': conn.get('RemoteAddress', ''),
                            'RemotePort': str(conn.get('RemotePort', '0')),
                            'State': conn.get('State', 'Unknown')
                        })
                    
                    self.root.after(0, self.update_connections_display, formatted_data)
                    self.add_log(f"Método de respaldo exitoso: {len(formatted_data)} conexiones")
                    
                except json.JSONDecodeError:
                    self.add_log("Error parseando respaldo, usando datos de ejemplo")
                    self.get_connections_simple()
            else:
                self.get_connections_simple()
                
        except Exception as e:
            self.add_log(f"Error en método de respaldo: {str(e)}")
            self.get_connections_simple()
            
    def update_connections_display(self, connections_data):
        # Limpiar tabla actual
        for item in self.connections_tree.get_children():
            self.connections_tree.delete(item)
            
        suspicious_connections = []
        
        for conn in connections_data:
            try:
                pid = conn.get('PID', 'N/A')
                process_name = conn.get('ProcessName', 'Unknown')
                protocol = conn.get('Protocol', 'TCP')
                local_addr = f"{conn.get('LocalAddress', '')}:{conn.get('LocalPort', '')}"
                remote_addr = f"{conn.get('RemoteAddress', '')}:{conn.get('RemotePort', '')}"
                state = conn.get('State', 'Unknown')
                
                # Determinar país (simulado)
                country = self.get_country_from_ip(conn.get('RemoteAddress', ''))
                
                # Insertar en tabla
                item = self.connections_tree.insert('', 'end', values=(
                    pid, process_name, protocol, local_addr, remote_addr, state, country
                ))
                
                # Verificar si es sospechoso
                risk_level, reason = self.analyze_connection(conn)
                if risk_level > 0:
                    suspicious_connections.append({
                        'risk': risk_level,
                        'pid': pid,
                        'process': process_name,
                        'remote_ip': conn.get('RemoteAddress', ''),
                        'remote_port': conn.get('RemotePort', ''),
                        'reason': reason
                    })
                    
                    # Colorear fila sospechosa
                    if risk_level >= 3:
                        self.connections_tree.set(item, 'País', f"🔴 {country}")
                    elif risk_level >= 2:
                        self.connections_tree.set(item, 'País', f"🟡 {country}")
                        
            except Exception as e:
                self.add_log(f"Error procesando conexión: {str(e)}")
                
        # Actualizar tabla de sospechosos
        self.update_suspicious_display(suspicious_connections)
        
        # Actualizar estadísticas
        self.update_statistics(connections_data, suspicious_connections)
        
    def update_suspicious_display(self, suspicious_connections):
        # Limpiar tabla de sospechosos
        for item in self.suspicious_tree.get_children():
            self.suspicious_tree.delete(item)
            
        # Ordenar por nivel de riesgo
        suspicious_connections.sort(key=lambda x: x['risk'], reverse=True)
        
        for conn in suspicious_connections:
            risk_icon = "🔴" if conn['risk'] >= 3 else "🟡" if conn['risk'] >= 2 else "🟢"
            risk_text = f"{risk_icon} {conn['risk']}/5"
            
            self.suspicious_tree.insert('', 'end', values=(
                risk_text, conn['pid'], conn['process'], 
                conn['remote_ip'], conn['remote_port'], conn['reason']
            ))
            
    def analyze_connection(self, conn):
        risk_level = 0
        reasons = []
        
        process_name = conn.get('ProcessName', '').lower()
        remote_ip = conn.get('RemoteAddress', '')
        remote_port = conn.get('RemotePort', 0)
        
        # Verificar proceso desconocido
        if process_name in ['unknown', ''] or 'temp' in process_name:
            risk_level += 2
            reasons.append("Proceso desconocido")
            
        # Verificar puertos sospechosos
        suspicious_ports = [1337, 31337, 4444, 5555, 6666, 7777, 8888, 9999]
        if remote_port in suspicious_ports:
            risk_level += 3
            reasons.append(f"Puerto sospechoso ({remote_port})")
            
        # Verificar IPs privadas vs públicas
        if not self.is_private_ip(remote_ip) and remote_ip not in ['127.0.0.1', '::1']:
            risk_level += 1
            reasons.append("Conexión externa")
            
        # Verificar procesos comunes que no deberían conectarse externamente
        suspicious_processes = ['notepad', 'calc', 'mspaint', 'wordpad']
        if any(proc in process_name for proc in suspicious_processes):
            risk_level += 4
            reasons.append("Proceso inusual con conexión externa")
            
        return min(risk_level, 5), "; ".join(reasons)
        
    def is_private_ip(self, ip):
        try:
            parts = ip.split('.')
            if len(parts) != 4:
                return False
                
            first = int(parts[0])
            second = int(parts[1])
            
            # Rangos de IP privadas
            if first == 10:
                return True
            elif first == 172 and 16 <= second <= 31:
                return True
            elif first == 192 and second == 168:
                return True
                
            return False
        except:
            return False
            
    def get_country_from_ip(self, ip):
        # Simulación simple de geolocalización
        if self.is_private_ip(ip) or ip in ['127.0.0.1', '::1']:
            return "Local"
        
        # Algunos rangos conocidos (simplificado)
        try:
            first_octet = int(ip.split('.')[0])
            if 1 <= first_octet <= 50:
                return "USA"
            elif 51 <= first_octet <= 100:
                return "Europa"
            elif 101 <= first_octet <= 150:
                return "Asia"
            else:
                return "Otros"
        except:
            return "Desconocido"
            
    def update_statistics(self, connections, suspicious):
        total_connections = len(connections)
        total_suspicious = len(suspicious)
        unique_processes = len(set(conn.get('ProcessName', '') for conn in connections))
        external_connections = sum(1 for conn in connections 
                                 if not self.is_private_ip(conn.get('RemoteAddress', '')))
        
        stats_text = f"""📊 ESTADÍSTICAS DE RED
{'='*50}
🔗 Total de conexiones activas: {total_connections}
⚠️  Conexiones sospechosas: {total_suspicious}
🔄 Procesos únicos: {unique_processes}
🌐 Conexiones externas: {external_connections}
📈 Nivel de riesgo promedio: {sum(s['risk'] for s in suspicious) / max(len(suspicious), 1):.1f}/5

🕒 Última actualización: {datetime.now().strftime('%H:%M:%S')}
"""
        
        self.stats_text.delete(1.0, tk.END)
        self.stats_text.insert(1.0, stats_text)
        
        # Actualizar gráfico simple
        graph_text = f"""📈 ACTIVIDAD DE RED (Últimos datos)
{'='*60}

🔗 Conexiones por tipo:
   TCP Establecidas: {'█' * min(total_connections, 50)} ({total_connections})
   
⚠️  Nivel de amenaza:
   Bajo (1-2):  {'█' * sum(1 for s in suspicious if s['risk'] <= 2)}
   Medio (3-4): {'█' * sum(1 for s in suspicious if 3 <= s['risk'] <= 4)}
   Alto (5):    {'█' * sum(1 for s in suspicious if s['risk'] == 5)}
   
🌍 Distribución geográfica:
   Local:    {'█' * sum(1 for conn in connections if self.is_private_ip(conn.get('RemoteAddress', '')))}
   Externa:  {'█' * external_connections}
"""
        
        self.graph_text.delete(1.0, tk.END)
        self.graph_text.insert(1.0, graph_text)
        
    def manual_refresh(self):
        if not self.monitoring:
            self.add_log("Actualización manual iniciada")
            threading.Thread(target=self.get_network_connections, daemon=True).start()
            
    def export_data(self):
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"red_monitor_export_{timestamp}.txt"
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(f"NMC TOTAL - REPORTE DE SEGURIDAD\n")
                f.write(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("="*60 + "\n\n")
                
                # Exportar conexiones
                f.write("CONEXIONES ACTIVAS:\n")
                f.write("-"*30 + "\n")
                for item in self.connections_tree.get_children():
                    values = self.connections_tree.item(item)['values']
                    f.write(f"PID: {values[0]} | Proceso: {values[1]} | Remota: {values[4]}\n")
                
                f.write("\n\nPROCESOS SOSPECHOSOS:\n")
                f.write("-"*30 + "\n")
                for item in self.suspicious_tree.get_children():
                    values = self.suspicious_tree.item(item)['values']
                    f.write(f"Riesgo: {values[0]} | PID: {values[1]} | Proceso: {values[2]} | Razón: {values[5]}\n")
                    
            self.add_log(f"Datos exportados a {filename}")
            messagebox.showinfo("Exportación", f"Datos exportados exitosamente a {filename}")
            
        except Exception as e:
            self.add_log(f"Error en exportación: {str(e)}")
            messagebox.showerror("Error", f"Error al exportar: {str(e)}")
            
    def on_connection_double_click(self, event):
        item = self.connections_tree.selection()[0]
        values = self.connections_tree.item(item)['values']
        
        info = f"""INFORMACIÓN DE CONEXIÓN
{'='*40}
PID: {values[0]}
Proceso: {values[1]}
Protocolo: {values[2]}
Dirección Local: {values[3]}
Dirección Remota: {values[4]}
Estado: {values[5]}
País: {values[6]}

¿Desea buscar esta IP en VirusTotal?"""
        
        result = messagebox.askyesno("Detalles de Conexión", info)
        if result:
            remote_ip = values[4].split(':')[0]
            webbrowser.open(f"https://www.virustotal.com/gui/ip-address/{remote_ip}")
            
    def show_context_menu(self, event):
        try:
            item = self.suspicious_tree.selection()[0]
            values = self.suspicious_tree.item(item)['values']
            
            menu = tk.Menu(self.root, tearoff=0)
            menu.add_command(label="🔍 Analizar en VirusTotal", 
                           command=lambda: self.analyze_in_virustotal(values))
            menu.add_command(label="⚠️ Terminar Proceso", 
                           command=lambda: self.kill_process(values[1]))
            menu.add_command(label="📋 Copiar PID", 
                           command=lambda: self.copy_to_clipboard(values[1]))
            
            menu.post(event.x_root, event.y_root)
        except:
            pass
            
    def analyze_in_virustotal(self, values):
        ip = values[3]
        webbrowser.open(f"https://www.virustotal.com/gui/ip-address/{ip}")
        self.add_log(f"Abriendo análisis de VirusTotal para IP: {ip}")
        
    def kill_process(self, pid):
        result = messagebox.askyesno("Confirmar", 
                                   f"¿Está seguro de que desea terminar el proceso PID {pid}?\n\n" +
                                   "ADVERTENCIA: Esto puede afectar el funcionamiento del sistema.")
        if result:
            try:
                subprocess.run(['taskkill', '/PID', str(pid), '/F'], check=True)
                self.add_log(f"Proceso {pid} terminado exitosamente")
                messagebox.showinfo("Éxito", f"Proceso {pid} terminado")
            except subprocess.CalledProcessError:
                self.add_log(f"Error al terminar proceso {pid}")
                messagebox.showerror("Error", f"No se pudo terminar el proceso {pid}")
                
    def copy_to_clipboard(self, text):
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        self.add_log(f"PID {text} copiado al portapapeles")

if __name__ == "__main__":
    root = tk.Tk()
    app = RedMonitorApp(root)
    root.mainloop()