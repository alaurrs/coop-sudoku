import { Component, inject, HostListener, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { GameStore } from '../store/game.store';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-sudoku-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], 
  template: `
    <div class="h-screen bg-[#fff5f7] dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 flex flex-col font-sans overflow-hidden relative transition-colors duration-300">
      
      <!-- Win/Game Over Modal Overlay -->
      <div *ngIf="store.status() === 'COMPLETED'" class="absolute inset-0 z-50 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
         <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center">
            
            <!-- Victory State -->
            <ng-container *ngIf="store.endReason() === 'SOLVED'">
                <div class="size-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <span class="material-symbols-outlined text-6xl">emoji_events</span>
                </div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Puzzle Solved!</h2>
                <p class="text-slate-500 dark:text-slate-400 mb-10">You completed the grid with {{store.mistakes()}} mistakes in {{elapsedTime()}}.</p>
            </ng-container>

            <!-- Surrender State -->
            <ng-container *ngIf="store.endReason() === 'SURRENDERED'">
                <div class="size-24 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <span class="material-symbols-outlined text-6xl">flag</span>
                </div>
                <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Game Over</h2>
                <p class="text-slate-500 dark:text-slate-400 mb-10">The game was surrendered.</p>
            </ng-container>

            <button class="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-95" (click)="reload()">
                Back to Lobby
            </button>
         </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="store.lastMoveStatus()" class="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
         <div class="px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-4 border-2"
              [class.bg-emerald-500]="store.lastMoveStatus() === 'CORRECT'"
              [class.text-white]="store.lastMoveStatus() === 'CORRECT'"
              [class.border-emerald-400]="store.lastMoveStatus() === 'CORRECT'"
              [class.bg-rose-500]="store.lastMoveStatus() === 'INCORRECT'"
              [class.text-white]="store.lastMoveStatus() === 'INCORRECT'"
              [class.border-rose-400]="store.lastMoveStatus() === 'INCORRECT'">
            <span class="material-symbols-outlined filled text-2xl">
                {{ store.lastMoveStatus() === 'CORRECT' ? 'check_circle' : 'cancel' }}
            </span>
            <span class="tracking-wide">
                {{ store.lastMoveStatus() === 'CORRECT' ? 'EXCELLENT MOVE!' : 'MISTAKE! TRY AGAIN.' }}
            </span>
         </div>
      </div>

      <!-- Header -->
      <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a] flex items-center justify-between px-6 shrink-0 z-20 backdrop-blur transition-colors duration-300">
        <div class="flex items-center gap-4 w-1/3">
           <div class="size-9 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
             <span class="material-symbols-outlined text-white">grid_view</span>
           </div>
           <h1 class="font-black text-slate-900 dark:text-white leading-tight tracking-tight hidden sm:block">Leverage Sudoku</h1>
        </div>

        <div class="flex flex-col items-center justify-center w-1/3">
           <div class="px-4 py-1 bg-slate-100 dark:bg-blue-500/10 border border-slate-200 dark:border-blue-500/20 rounded-xl shadow-sm">
              <span class="text-[10px] text-slate-400 dark:text-blue-400 font-black uppercase tracking-[0.2em] block text-center leading-none mb-1">Room Code</span>
              <span class="text-lg font-mono font-black text-slate-900 dark:text-white tracking-widest leading-none">{{ store.roomId() }}</span>
           </div>
        </div>

        <div class="flex items-center justify-end gap-3 w-1/3">
           <button class="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <span class="material-symbols-outlined text-[18px]">share</span>
              <span class="hidden md:inline">Invite Player</span>
           </button>
           <button (click)="themeService.toggleTheme()" class="size-9 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-transparent rounded-xl transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
           </button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        
        <!-- Left Sidebar (Stats) -->
        <aside class="w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col p-8 gap-10 overflow-y-auto hidden lg:flex transition-colors duration-300">
           <!-- Stats Cards -->
           <div>
              <h3 class="text-[10px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Game Stats</h3>
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-rose-50/50 dark:bg-[#1e293b] border border-rose-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center h-28 shadow-sm dark:shadow-none">
                    <div class="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{{ elapsedTime() }}</div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2">Time</div>
                 </div>
                 <div class="bg-rose-50/50 dark:bg-[#1e293b] border border-rose-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center h-28 shadow-sm dark:shadow-none">
                    <div class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ store.difficulty() }}</div>
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2">Difficulty</div>
                 </div>
                 <div class="col-span-2 bg-rose-50/50 dark:bg-[#1e293b] border border-rose-100 dark:border-slate-700 p-5 rounded-2xl flex items-center justify-between h-20 px-6 shadow-sm dark:shadow-none">
                    <div class="flex flex-col">
                       <div class="text-2xl font-black text-slate-900 dark:text-white leading-none">{{ store.mistakes() }} / 3</div>
                       <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Mistakes</div>
                    </div>
                    <div class="size-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
                       <span class="material-symbols-outlined text-[20px] filled">warning</span>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Active Players -->
           <div class="flex-1">
              <h3 class="text-[10px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Active Players</h3>
              <div class="space-y-4">
                 <!-- Me -->
                 <div class="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/50 border-2 border-blue-500 shadow-lg shadow-blue-500/10 relative overflow-hidden transition-all">
                    <div class="absolute inset-0 bg-blue-50 dark:bg-blue-500/5 z-0"></div>
                    <div class="relative z-10 size-11 rounded-full border-2 border-blue-500 p-0.5 shadow-sm">
                       <img [src]="getAvatarUrl(store.userAvatar())" class="rounded-full bg-white dark:bg-slate-900">
                    </div>
                    <div class="relative z-10 flex-1 min-w-0">
                       <div class="text-sm font-black text-slate-900 dark:text-white truncate">{{ store.currentUser() }}</div>
                       <div class="text-[10px] text-blue-500 font-black uppercase tracking-wider truncate">Suggesting</div>
                    </div>
                    <div class="relative z-10 size-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                 </div>

                 <!-- Partner -->
                 <ng-container *ngFor="let p of otherPlayers()">
                    <div class="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                        <div class="relative size-11 rounded-full border-2 border-slate-200 dark:border-rose-500 p-0.5 group-hover:border-rose-400 transition-colors">
                            <img [src]="getAvatarUrl(p.avatar)" class="rounded-full bg-slate-100 dark:bg-slate-900">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold text-slate-700 dark:text-white truncate">{{p.username}}</div>
                            <div class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">Thinking...</div>
                        </div>
                        <div class="size-2 rounded-full bg-slate-300 dark:bg-rose-500"></div>
                    </div>
                 </ng-container>
              </div>
           </div>

           <button (click)="store.surrenderGame()" class="w-full py-4 rounded-2xl border-2 border-rose-100 dark:border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/10 font-black text-xs uppercase tracking-[0.1em] transition-all active:scale-95">
              Surrender Game
           </button>
        </aside>

        <!-- Main Board Area -->
        <main class="flex-1 bg-white dark:bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-y-auto transition-colors duration-300">
           
           <div class="absolute inset-0 bg-[radial-gradient(#ffe4e6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 dark:opacity-0 pointer-events-none"></div>

           <div class="absolute bottom-10 right-10 opacity-5 dark:opacity-5 pointer-events-none select-none">
               <span class="material-symbols-outlined text-[300px]">pets</span>
           </div>

           <!-- Turn Notification Pill -->
           <div *ngIf="pending() as p" class="absolute top-10 z-20 animate-bounce">
              <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl px-8 py-3 flex items-center gap-4">
                 <span class="material-symbols-outlined text-rose-500 dark:text-blue-400 filled text-2xl">lightbulb</span>
                 <span class="text-sm font-bold text-slate-700 dark:text-slate-200">
                    <span *ngIf="isMyConfirm()"><strong class="text-slate-900 dark:text-white">{{p.suggesterName}}</strong> suggested <strong class="text-rose-500 dark:text-blue-400 text-xl mx-1 underline decoration-2 underline-offset-4">{{p.value}}</strong> at cell R{{p.row+1}} C{{p.col+1}}</span>
                    <span *ngIf="!isMyConfirm()" class="text-slate-500">Suggestion sent... Waiting for partner</span>
                 </span>
              </div>
           </div>

           <!-- Grid Container -->
           <div class="flex flex-col gap-10 w-full max-w-xl items-center relative z-10">
              
              <!-- 9x9 Grid -->
              <div class="grid grid-cols-9 gap-px bg-rose-300 dark:bg-slate-500 border-[6px] border-rose-400 dark:border-slate-700 rounded-xl shadow-2xl select-none relative overflow-hidden transition-colors duration-300" 
                   (mouseleave)="hoverCell.set(null)">
                 
                 <ng-container *ngFor="let row of grid(); let r = index">
                    <div *ngFor="let cell of row; let c = index"
                         (click)="onCellClick(r, c)"
                         (mouseenter)="hoverCell.set({r, c})"
                         class="size-11 sm:size-16 flex items-center justify-center text-2xl sm:text-3xl font-black cursor-pointer transition-all duration-150 relative"
                         [class.bg-white]="!themeService.isDark() && !((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.bg-rose-400]="!themeService.isDark() && ((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.dark:bg-[#0f172a]]="themeService.isDark() && !((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.dark:bg-slate-800]="themeService.isDark() && ((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.!bg-blue-500]="selected()?.r === r && selected()?.c === c"
                         [class.!text-white]="selected()?.r === r && selected()?.c === c"
                         [class.!bg-blue-100/60]="highlightedValue() && cell === highlightedValue() && !themeService.isDark() && (selected()?.r !== r || selected()?.c !== c)"
                         [class.dark:!bg-blue-900/40]="highlightedValue() && cell === highlightedValue() && (selected()?.r !== r || selected()?.c !== c)"
                         [class.!bg-rose-100/40]="!themeService.isDark() && !highlightedValue() && (hoverCell()?.r === r || hoverCell()?.c === c)"
                         [class.dark:!bg-slate-700]="!highlightedValue() && (hoverCell()?.r === r || hoverCell()?.c === c)"
                    >
                       <!-- Value -->
                       <span *ngIf="cell !== 0" 
                             class="transition-colors"
                             [class.text-white]="(selected()?.r === r && selected()?.c === c) || (!themeService.isDark() && ((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5)))"
                             [class.text-rose-500]="!themeService.isDark() && !(selected()?.r === r && selected()?.c === c) && !((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                             [class.dark:text-blue-200]="themeService.isDark() && !(selected()?.r === r && selected()?.c === c)">{{ cell }}</span>

                       <!-- Pending Ghost -->
                       <ng-container *ngIf="cell === 0 && isPendingCell(r, c)">
                          <div class="absolute inset-0 flex items-center justify-center z-10 bg-blue-500 shadow-inner">
                             <span class="text-white font-black text-3xl animate-pulse">{{ pending()?.value }}</span>
                             <div class="absolute top-2 right-2 size-2.5 bg-white rounded-full shadow-sm"></div>
                          </div>
                       </ng-container>
                       
                       <div *ngIf="selected()?.r === r && selected()?.c === c" class="absolute top-1.5 right-1.5 size-2 bg-white/50 rounded-full"></div>

                    </div>
                 </ng-container>

                 <!-- Thick separators (3x3 blocks) -->
                 <div class="absolute left-[33.33%] top-0 bottom-0 w-[4px] bg-rose-400 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute left-[66.66%] top-0 bottom-0 w-[4px] bg-rose-400 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute top-[33.33%] left-0 right-0 h-[4px] bg-rose-400 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute top-[66.66%] left-0 right-0 h-[4px] bg-rose-400 dark:bg-slate-400 pointer-events-none z-20"></div>

              </div>

              <!-- Controls / Action Bar -->
              <div class="w-full flex items-center justify-between gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur transition-colors duration-300">
                 
                 <div class="flex items-center gap-3 shrink-0">
                    <button class="size-12 md:size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-transparent transition-all flex items-center justify-center shadow-sm">
                       <span class="material-symbols-outlined text-2xl">undo</span>
                    </button>
                    <button class="size-12 md:size-14 rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center active:scale-95">
                       <span class="material-symbols-outlined text-2xl filled">edit</span>
                    </button>
                    <button class="size-12 md:size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-transparent transition-all flex items-center justify-center shadow-sm">
                       <span class="material-symbols-outlined text-2xl">backspace</span>
                    </button>
                 </div>

                 <div *ngIf="!pending()" class="flex-1 flex justify-center gap-2 md:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" 
                            (click)="onNumberInput(num)"
                            class="size-10 md:size-12 min-w-[2.5rem] md:min-w-[3rem] rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 text-slate-700 dark:text-slate-300 font-black text-xl transition-all flex items-center justify-center shadow-sm active:scale-90">
                       {{num}}
                    </button>
                 </div>

                 <div *ngIf="isMyConfirm()" class="flex gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <button (click)="onConfirm(true)" class="h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/25 flex items-center gap-3 transition-all active:scale-95">
                       <span class="material-symbols-outlined text-xl">check_circle</span>
                       Confirm "{{pending()?.value}}"
                    </button>
                    <button (click)="onConfirm(false)" class="h-14 px-8 bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest text-xs rounded-2xl border-2 border-rose-100 dark:border-transparent transition-all items-center gap-3 active:scale-95 flex">
                       <span class="material-symbols-outlined text-xl">cancel</span>
                       Reject
                    </button>
                 </div>

              </div>

           </div>
        </main>

        <!-- Right Sidebar (Chat) -->
        <aside class="w-80 bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex transition-colors duration-300">
           <div class="flex border-b border-slate-200 dark:border-slate-800">
              <button class="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 border-b-4 border-blue-500">Chat</button>
              <button class="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Activity Log</button>
           </div>
           
           <div class="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col scrollbar-hide">
              <ng-container *ngFor="let msg of store.chatMessages()">
                  <!-- Message -->
                  <div class="flex gap-4" [class.flex-row-reverse]="msg.userId === store.currentUserId()">
                     <div class="relative shrink-0">
                        <img [src]="getAvatarUrl(msg.avatar)" class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-transparent shadow-sm">
                        <div *ngIf="msg.userId !== store.currentUserId()" class="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f172a]"></div>
                     </div>
                     <div class="flex-1 space-y-1.5" [class.items-end]="msg.userId === store.currentUserId()" [class.flex]="msg.userId === store.currentUserId()" [class.flex-col]="msg.userId === store.currentUserId()">
                        <div class="flex items-baseline gap-2">
                           <span *ngIf="msg.userId !== store.currentUserId()" class="text-xs font-black text-slate-900 dark:text-white tracking-tight">{{msg.username}}</span>
                           <span class="text-[10px] text-slate-400 font-bold">{{ msg.timestamp | date:'shortTime' }}</span>
                           <span *ngIf="msg.userId === store.currentUserId()" class="text-xs font-black text-slate-900 dark:text-white tracking-tight">You</span>
                        </div>
                        <div class="text-[13px] font-medium p-4 rounded-3xl max-w-[220px] leading-relaxed shadow-sm transition-colors duration-300"
                             [class.bg-slate-100]="msg.userId !== store.currentUserId()"
                             [class.dark:bg-slate-800]="msg.userId !== store.currentUserId()"
                             [class.rounded-tl-none]="msg.userId !== store.currentUserId()"
                             [class.text-slate-700]="msg.userId !== store.currentUserId()"
                             [class.dark:text-slate-300]="msg.userId !== store.currentUserId()"
                             [class.bg-blue-500]="msg.userId === store.currentUserId()"
                             [class.text-white]="msg.userId === store.currentUserId()"
                             [class.rounded-tr-none]="msg.userId === store.currentUserId()">
                           {{ msg.message }}
                        </div>
                     </div>
                  </div>
              </ng-container>
              
              <div *ngIf="store.chatMessages().length === 0" class="text-center py-20">
                 <div class="size-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
                    <span class="material-symbols-outlined text-3xl">chat_bubble</span>
                 </div>
                 <div class="text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">No messages yet. Say hi!</div>
              </div>
           </div>

           <div class="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-colors duration-300">
              <div class="relative group">
                 <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendChat()" placeholder="Type a message..." 
                        class="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner">
                 <button (click)="sendChat()" class="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center active:scale-90">
                    <span class="material-symbols-outlined text-[20px]">send</span>
                 </button>
              </div>
           </div>
        </aside>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class SudokuBoardComponent implements OnInit, OnDestroy {
  readonly store = inject(GameStore);
  public themeService = inject(ThemeService);
  
  hoverCell = signal<{r: number, c: number} | null>(null);
  chatInput = '';
  elapsedTime = signal('00:00');
  private timerInterval: any;

  readonly grid = this.store.grid;
  readonly selected = this.store.selectedCell;
  readonly pending = this.store.pendingSuggestion;
  readonly isMyConfirm = this.store.isMyTurnToConfirm;

  readonly highlightedValue = computed(() => {
    const sel = this.selected();
    if (!sel) return null;
    const val = this.grid()[sel.r][sel.c];
    return val !== 0 ? val : null;
  });
  
  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  getAvatarUrl(name: string | null | undefined) {
    if (!name || name === 'guest') return 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
        const start = this.store.startTime();
        if (!start) return; 

        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        
        if (diff < 0) {
             this.elapsedTime.set('00:00');
             return;
        }

        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        this.elapsedTime.set(`${m}:${s}`);
    }, 1000);
  }

  otherPlayers() {
     const all = this.store.players() || [];
     const me = this.store.currentUserId();
     return all.filter(p => p.id !== me);
  }

  onCellClick(r: number, c: number) {
    this.store.selectCell(r, c);
  }

  onNumberInput(num: number) {
    this.store.makeSuggestion(num);
  }

  onConfirm(accepted: boolean) {
    this.store.confirmSuggestion(accepted);
  }
  
  sendChat() {
    if (this.chatInput.trim()) {
        this.store.sendMessage(this.chatInput);
        this.chatInput = '';
    }
  }

  isPendingCell(r: number, c: number): boolean {
    const p = this.pending();
    return !!p && p.row === r && p.col === c;
  }
  
  reload() {
    this.store.resetGame();
  }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const num = parseInt(event.key);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      if (document.activeElement?.tagName === 'INPUT') return;
      this.onNumberInput(num);
    }
  }
}