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
    <div class="h-screen bg-[#f2dbe2] dark:bg-[#0f172a] text-[#881337] dark:text-slate-200 flex flex-col font-sans overflow-hidden relative transition-colors duration-300">
      
      <!-- Fixed Stickers Background (Light Mode Only) -->
      <div class="fixed top-20 right-10 opacity-10 pointer-events-none rotate-12 dark:hidden">
        <svg fill="white" height="180" viewBox="0 0 24 24" width="180"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path></svg>
      </div>

      <!-- Win/Game Over Modal Overlay -->
      <div *ngIf="store.status() === 'COMPLETED'" class="absolute inset-0 z-50 bg-[#1f1013]/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
         <div class="bg-[#fff0f5] dark:bg-[#1e293b] border border-pink-200 dark:border-slate-700 p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center mx-4 relative overflow-hidden">
            <!-- Modal Stickers -->
            <svg class="absolute -top-6 -left-6 w-20 h-20 text-white opacity-50 dark:hidden" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"></circle><ellipse cx="9" cy="8" rx="1.5" ry="5" transform="rotate(-20 9 12)"></ellipse><ellipse cx="15" cy="8" rx="1.5" ry="5" transform="rotate(20 15 12)"></ellipse></svg>

            <ng-container *ngIf="store.endReason() === 'SOLVED'">
                <div class="size-20 md:size-24 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
                    <span class="material-symbols-outlined text-5xl md:text-6xl">emoji_events</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Puzzle Solved!</h2>
                <p class="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-8 md:mb-10 font-bold uppercase tracking-widest">Victory! ✨</p>
            </ng-container>

            <ng-container *ngIf="store.endReason() === 'SURRENDERED'">
                <div class="size-20 md:size-24 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-sm">
                    <span class="material-symbols-outlined text-5xl md:text-6xl">flag</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Game Over</h2>
                <p class="text-sm md:text-base text-slate-500 dark:text-slate-400 mb-8 md:mb-10 font-bold uppercase tracking-widest">Surrendered 😴</p>
            </ng-container>

            <button class="w-full py-4 bg-[#3b82f6] hover:bg-blue-600 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs" (click)="reload()">
                Back to Lobby
            </button>
         </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="store.lastMoveStatus()" class="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
        <div [class]="store.lastMoveStatus() === 'CORRECT' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'"
             class="px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-black uppercase tracking-wider text-xs md:text-sm border-2 border-white/20">
            <span class="material-symbols-outlined text-xl md:text-2xl">
                {{ store.lastMoveStatus() === 'CORRECT' ? 'check_circle' : 'cancel' }}
            </span>
            <span>
                {{ store.lastMoveStatus() === 'CORRECT' ? 'Excellent Move!' : 'Oops! Incorrect' }}
            </span>
        </div>
      </div>

      <!-- Header -->
      <header class="h-16 border-b border-pink-200 dark:border-slate-800 bg-[#fff0f5]/90 dark:bg-[#0f172a]/95 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 backdrop-blur transition-colors duration-300 shadow-sm">
        <div class="flex items-center gap-3 md:gap-4 w-1/4 relative group">
           <div class="size-8 md:size-9 bg-[#3b82f6] rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden">
             <span class="material-symbols-outlined text-white text-xl md:text-2xl">grid_view</span>
           </div>
           <h1 class="font-bold text-slate-900 dark:text-white leading-tight tracking-tight hidden lg:block whitespace-nowrap">Sudoku Co-op</h1>
           <!-- Header Sticker -->
           <svg class="absolute -top-4 -right-2 w-8 h-8 text-white rotate-12 dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path><circle cx="10" cy="11.5" fill="#881337" r="1"></circle><circle cx="14" cy="11.5" fill="#881337" r="1"></circle></svg>
        </div>

        <div class="flex flex-col items-center justify-center flex-1">
           <div class="px-3 py-1 md:px-4 md:py-1 bg-white/60 dark:bg-blue-500/10 border border-pink-100 dark:border-blue-500/20 rounded-xl shadow-sm relative overflow-visible">
              <span class="text-[8px] md:text-[10px] text-pink-400 dark:text-blue-400 font-black uppercase tracking-[0.2em] block text-center leading-none mb-0.5 md:mb-1">Room</span>
              <span class="text-sm md:text-lg font-mono font-black text-slate-900 dark:text-white tracking-widest leading-none uppercase">{{ store.roomId() }}</span>
              <!-- Room Sticker -->
              <svg class="absolute -bottom-3 -right-4 w-6 h-6 rotate-[-25deg] dark:hidden" fill="none" viewBox="0 0 24 24"><path d="M12 21.5C16.5 19 19 14.5 19 9.5C19 6 17 4 12 4C7 4 5 6 5 9.5C5 14.5 7.5 19 12 21.5Z" fill="#f43f5e"></path><path d="M12 4C13.5 2 15.5 1.5 17.5 2.5C15.5 4.5 14.5 5.5 12 6.5C9.5 5.5 8.5 4.5 6.5 2.5C8.5 1.5 10.5 2 12 4Z" fill="#4ade80"></path></svg>
           </div>
        </div>

        <div class="flex items-center justify-end gap-2 md:gap-3 w-1/4">
           <button (click)="isStatsOpen.set(!isStatsOpen()); isChatOpen.set(false)" 
                   class="lg:hidden size-9 bg-white dark:bg-slate-800 text-pink-400 dark:text-slate-400 border border-pink-100 dark:border-transparent rounded-xl flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-[20px]">analytics</span>
           </button>
           <button (click)="isChatOpen.set(!isChatOpen()); isStatsOpen.set(false)" 
                   class="lg:hidden size-9 bg-white dark:bg-slate-800 text-pink-400 dark:text-slate-400 border border-pink-100 dark:border-transparent rounded-xl flex items-center justify-center relative shadow-sm">
              <span class="material-symbols-outlined text-[20px]">chat</span>
              <div *ngIf="store.chatMessages().length > 0" class="absolute -top-1 -right-1 size-4 bg-[#f43f5e] rounded-full border-2 border-[#fff0f5] dark:border-[#0f172a] text-[8px] font-bold text-white flex items-center justify-center">!</div>
           </button>
           <button (click)="themeService.toggleTheme()" class="size-9 bg-white dark:bg-slate-800 text-slate-500 border border-pink-100 dark:border-transparent rounded-xl flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-[20px]">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
           </button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden relative z-10">
        
        <!-- Sidebar (Stats) -->
        <aside class="fixed inset-y-0 left-0 w-72 bg-[#fff0f5]/80 dark:bg-[#1e293b]/80 border-r border-pink-200 dark:border-slate-800 z-40 flex flex-col p-6 md:p-8 gap-8 overflow-y-auto transition-all duration-300 transform lg:relative lg:translate-x-0 backdrop-blur-md"
               [class.-translate-x-full]="!isStatsOpen() && !isDesktop()"
               [class.translate-x-0]="isStatsOpen() || isDesktop()">
           
           <div class="flex items-center justify-between lg:hidden mb-4">
              <h3 class="font-black text-[#881337] dark:text-white">Stats</h3>
              <button (click)="isStatsOpen.set(false)" class="text-pink-300"><span class="material-symbols-outlined">close</span></button>
           </div>

           <div>
              <h3 class="text-[10px] font-black text-[#f43f5e] dark:text-blue-400 uppercase tracking-[0.2em] mb-6">Game Stats</h3>
              <div class="grid grid-cols-2 gap-4">
                 <div class="bg-white/60 dark:bg-[#0f172a]/60 border border-pink-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center h-24 md:h-28 shadow-sm">
                    <div class="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{{ elapsedTime() }}</div>
                    <div class="text-[9px] md:text-[10px] text-pink-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2">Time</div>
                 </div>
                 <div class="bg-white/60 dark:bg-[#0f172a]/60 border border-pink-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center h-24 md:h-28 shadow-sm">
                    <div class="text-sm md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{{ store.difficulty() }}</div>
                    <div class="text-[9px] md:text-[10px] text-pink-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-2">Level</div>
                 </div>
                 <div class="col-span-2 bg-white/60 dark:bg-[#0f172a]/60 border border-pink-100 dark:border-slate-700 p-4 md:p-5 rounded-2xl flex items-center justify-between h-16 md:h-20 px-6 shadow-sm">
                    <div class="flex flex-col">
                       <div class="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">{{ store.mistakes() }} / 3</div>
                       <div class="text-[9px] md:text-[10px] text-pink-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Mistakes</div>
                    </div>
                    <div class="size-8 md:size-10 rounded-xl bg-[#f43f5e] text-white flex items-center justify-center shadow-lg">
                       <span class="material-symbols-outlined text-[18px] md:text-[20px] filled">warning</span>
                    </div>
                 </div>
              </div>
           </div>

           <div class="flex-1">
              <h3 class="text-[10px] font-black text-[#f43f5e] dark:text-blue-400 uppercase tracking-[0.2em] mb-6">Active Players</h3>
              <div class="space-y-4">
                 <div class="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/80 dark:bg-slate-800/50 border-2 border-[#3b82f6] shadow-lg relative overflow-visible transition-all">
                    <!-- Little Bunny -->
                    <svg class="absolute -top-3 -right-3 w-8 h-8 text-white drop-shadow-md dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path></svg>
                    
                    <div class="relative z-10 size-9 md:size-11 rounded-full border-2 border-blue-500 p-0.5 shadow-sm">
                       <img [src]="getAvatarUrl(store.userAvatar())" class="rounded-full bg-white dark:bg-slate-900">
                    </div>
                    <div class="relative z-10 flex-1 min-w-0">
                       <div class="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{{ store.currentUser() }}</div>
                       <div class="text-[8px] md:text-[10px] text-blue-500 font-black uppercase tracking-wider truncate">Suggesting</div>
                    </div>
                    <div class="relative z-10 size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                 </div>

                 <ng-container *ngFor="let p of otherPlayers()">
                    <div class="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border border-pink-100 dark:border-transparent bg-white/40 hover:bg-white/60 dark:hover:bg-slate-800/50 transition-all group">
                        <div class="relative size-9 md:size-11 rounded-full border-2 border-pink-200 dark:border-blue-500 p-0.5 shadow-sm">
                            <img [src]="getAvatarUrl(p.avatar)" class="rounded-full bg-white dark:bg-slate-900">
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-xs md:text-sm font-bold text-slate-700 dark:text-white truncate">{{p.username}}</div>
                            <div class="text-[8px] md:text-[10px] text-pink-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">Thinking...</div>
                        </div>
                        <div class="size-2 rounded-full bg-pink-200 dark:bg-blue-500"></div>
                    </div>
                 </ng-container>
              </div>
           </div>

           <button (click)="store.surrenderGame()" class="w-full py-4 rounded-2xl border-2 border-pink-200 dark:border-rose-500/20 text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.1em] active:scale-95 shadow-sm">
              Surrender Game
           </button>
        </aside>

        <!-- Main Board Area -->
        <main class="flex-1 bg-white dark:bg-[#020617] flex flex-col items-center justify-center p-2 md:p-4 relative overflow-y-auto transition-colors duration-300 scrollbar-hide">
           
           <div class="absolute inset-0 bg-[radial-gradient(#ffe4e6_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 md:opacity-40 dark:opacity-0 pointer-events-none"></div>

           <!-- Stickers Decoration -->
           <div class="absolute bottom-10 right-10 opacity-5 pointer-events-none select-none dark:hidden">
               <svg class="bunny-sticker" fill="white" height="200" viewBox="0 0 24 24" width="200"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path></svg>
           </div>

           <!-- Grid Container -->
           <div class="flex flex-col gap-6 md:gap-10 w-full max-w-xl items-center relative z-10 py-10 md:py-0">
              
              <!-- 9x9 Grid -->
              <div class="grid grid-cols-9 gap-px bg-pink-200 dark:bg-slate-500 border-[4px] md:border-[6px] border-pink-300 dark:border-slate-700 rounded-xl shadow-2xl select-none relative overflow-hidden transition-colors duration-300 mx-auto">
                 
                 <ng-container *ngFor="let row of grid(); let r = index">
                    <div *ngFor="let cell of row; let c = index"
                         (click)="onCellClick(r, c)"
                         (mouseenter)="hoverCell.set({r, c})"
                         class="size-9 sm:size-12 md:size-16 flex items-center justify-center text-lg sm:text-2xl md:text-3xl font-black cursor-pointer transition-all duration-150 relative"
                         [class.bg-[#fff0f5]]="!themeService.isDark() && !((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.bg-pink-100]="!themeService.isDark() && ((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.dark:bg-[#0f172a]]="themeService.isDark() && !((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.dark:bg-slate-800]="themeService.isDark() && ((r < 3 || r > 5) && (c > 2 && c < 6) || (r > 2 && r < 6) && (c < 3 || c > 5))"
                         [class.!bg-[#3b82f6]]="selected()?.r === r && selected()?.c === c"
                         [class.!text-white]="selected()?.r === r && selected()?.c === c"
                         [class.!bg-blue-100]="!themeService.isDark() && highlightedValue() && cell === highlightedValue() && (selected()?.r !== r || selected()?.c !== c)"
                         [class.dark:!bg-blue-900/50]="themeService.isDark() && highlightedValue() && cell === highlightedValue() && (selected()?.r !== r || selected()?.c !== c)"
                         [class.ring-2]="highlightedValue() && cell === highlightedValue() && (selected()?.r !== r || selected()?.c !== c)"
                         [class.ring-inset]="highlightedValue() && cell === highlightedValue()"
                         [class.ring-[#3b82f6]]="highlightedValue() && cell === highlightedValue() && (selected()?.r !== r || selected()?.c !== c)"
                    >
                       <div *ngFor="let cursor of getCursorsInCell(r, c)" 
                            class="absolute inset-0 border-2 border-dashed border-[#f43f5e] dark:border-blue-500 z-20 pointer-events-none animate-pulse flex items-start justify-end p-0.5">
                          <div class="bg-[#f43f5e] dark:bg-blue-500 text-white text-[8px] font-black px-1 rounded-sm shadow-sm">{{cursor.username}}</div>
                       </div>

                       <span *ngIf="cell !== 0" 
                             class="transition-colors"
                             [class.text-[#881337]]="!themeService.isDark() && !(selected()?.r === r && selected()?.c === c)"
                             [class.dark:text-blue-200]="themeService.isDark() && !(selected()?.r === r && selected()?.c === c)">{{ cell }}</span>

                       <ng-container *ngIf="cell === 0 && isPendingCell(r, c)">
                          <div class="absolute inset-0 flex items-center justify-center z-10 bg-[#3b82f6] shadow-inner">
                             <span class="text-white font-black text-xl md:text-3xl animate-pulse">{{ pending()?.value }}</span>
                          </div>
                       </ng-container>
                       
                       <div *ngIf="selected()?.r === r && selected()?.c === c" class="absolute top-1 right-1 size-1.5 bg-white/50 rounded-full"></div>
                    </div>
                 </ng-container>

                 <!-- Grid Dividers -->
                 <div class="absolute left-[33.33%] top-0 bottom-0 w-[2px] md:w-[4px] bg-pink-300 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute left-[66.66%] top-0 bottom-0 w-[2px] md:w-[4px] bg-pink-300 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute top-[33.33%] left-0 right-0 h-[2px] md:h-[4px] bg-pink-300 dark:bg-slate-400 pointer-events-none z-20"></div>
                 <div class="absolute top-[66.66%] left-0 right-0 h-[2px] md:h-[4px] bg-pink-300 dark:bg-slate-400 pointer-events-none z-20"></div>
              </div>

              <!-- Action Bar -->
              <div class="w-full flex items-center justify-between gap-4 p-4 md:p-6 rounded-[2rem] bg-[#fff0f5]/80 dark:bg-[#1e293b]/80 border border-pink-100 dark:border-slate-800 shadow-xl backdrop-blur transition-colors">
                 <div class="flex items-center gap-2 md:gap-3 shrink-0">
                    <button class="size-10 md:size-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 text-pink-300 border border-pink-50 flex items-center justify-center shadow-sm"><span class="material-symbols-outlined">undo</span></button>
                    <button class="size-10 md:size-14 rounded-xl md:rounded-2xl bg-[#3b82f6] text-white shadow-lg flex items-center justify-center active:scale-95"><span class="material-symbols-outlined filled">edit</span></button>
                 </div>

                 <div *ngIf="!pending()" class="flex-1 overflow-x-auto pb-1 scrollbar-hide px-2">
                    <div class="flex gap-1.5 md:gap-3 mx-auto w-max min-w-full justify-center">
                        <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" 
                                (click)="onNumberInput(num)"
                                class="size-9 md:size-12 min-w-[2.2rem] md:min-w-[3rem] rounded-lg md:rounded-2xl bg-white dark:bg-slate-800 border-2 border-pink-50 dark:border-slate-700 hover:border-[#3b82f6] text-[#881337] dark:text-slate-300 font-black text-lg md:text-xl transition-all flex items-center justify-center shadow-sm active:scale-90 flex-shrink-0">
                           {{num}}
                        </button>
                    </div>
                 </div>

                 <div *ngIf="isMyConfirm()" class="flex gap-2 md:gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <button (click)="onConfirm(true)" class="h-10 md:h-14 px-4 md:px-8 bg-[#3b82f6] text-white font-black uppercase text-[10px] md:text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95">Confirm</button>
                    <button (click)="onConfirm(false)" class="h-10 md:h-14 px-4 md:px-8 bg-white dark:bg-slate-700 text-[#f43f5e] font-black uppercase text-[10px] md:text-xs rounded-xl border-2 border-pink-100 active:scale-95">Reject</button>
                 </div>
              </div>

           </div>
        </main>

        <!-- Sidebar (Chat) -->
        <aside class="fixed inset-y-0 right-0 w-80 bg-[#fff0f5]/90 dark:bg-[#0f172a]/90 border-l border-pink-200 dark:border-slate-800 z-40 flex flex-col transition-all duration-300 transform lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none backdrop-blur-md"
               [class.translate-x-full]="!isChatOpen() && !isDesktop()"
               [class.translate-x-0]="isChatOpen() || isDesktop()">
           
           <div class="flex items-center justify-between p-4 border-b border-pink-100 dark:border-slate-800">
              <h3 class="font-black text-[#881337] dark:text-white uppercase text-xs tracking-widest">Game Chat</h3>
              <button (click)="isChatOpen.set(false)" class="lg:hidden text-pink-300"><span class="material-symbols-outlined">close</span></button>
           </div>

           <div class="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto flex flex-col scrollbar-hide relative">
              <!-- Background Strawberry -->
              <svg class="absolute bottom-10 left-10 w-20 h-20 opacity-10 rotate-12 dark:hidden" fill="none" viewBox="0 0 24 24"><path d="M12 21.5C16.5 19 19 14.5 19 9.5C19 6 17 4 12 4C7 4 5 6 5 9.5C5 14.5 7.5 19 12 21.5Z" fill="#f43f5e"></path><path d="M12 4C13.5 2 15.5 1.5 17.5 2.5C15.5 4.5 14.5 5.5 12 6.5C9.5 5.5 8.5 4.5 6.5 2.5C8.5 1.5 10.5 2 12 4Z" fill="#4ade80"></path></svg>

              <ng-container *ngFor="let msg of store.chatMessages()">
                  <div class="flex gap-3 md:gap-4 relative z-10" [class.flex-row-reverse]="msg.userId === store.currentUserId()">
                     <div class="relative shrink-0">
                        <img [src]="getAvatarUrl(msg.avatar)" class="size-8 md:size-10 rounded-full bg-white dark:bg-slate-800 border-2 border-pink-50 shadow-sm">
                     </div>
                     <div class="flex-1 space-y-1" [class.items-end]="msg.userId === store.currentUserId()" [class.flex]="msg.userId === store.currentUserId()" [class.flex-col]="msg.userId === store.currentUserId()">
                        <div class="flex items-baseline gap-2">
                           <span *ngIf="msg.userId !== store.currentUserId()" class="text-[10px] md:text-xs font-black text-slate-900 dark:text-white">{{msg.username}}</span>
                           <span class="text-[8px] md:text-[10px] text-pink-400">{{ msg.timestamp | date:'shortTime' }}</span>
                        </div>
                        <div class="text-xs md:text-[13px] font-medium p-3 md:p-4 rounded-2xl shadow-sm"
                             [class.bg-white]="msg.userId !== store.currentUserId()"
                             [class.text-slate-700]="msg.userId !== store.currentUserId()"
                             [class.bg-[#3b82f6]]="msg.userId === store.currentUserId()"
                             [class.text-white]="msg.userId === store.currentUserId()">
                           {{ msg.message }}
                        </div>
                     </div>
                  </div>
              </ng-container>
           </div>

           <div class="p-4 md:p-6 border-t border-pink-100 dark:border-slate-800 bg-white/50">
              <div class="relative">
                 <input type="text" [(ngModel)]="chatInput" (keyup.enter)="sendChat()" placeholder="Type..." 
                        class="w-full bg-white dark:bg-slate-900 border-2 border-pink-100 dark:border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-inner">
                 <button (click)="sendChat()" class="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-[#3b82f6] text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-[18px]">send</span>
                 </button>
              </div>
           </div>
        </aside>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class SudokuBoardComponent implements OnInit, OnDestroy {
  readonly store = inject(GameStore);
  public themeService = inject(ThemeService);
  
  isStatsOpen = signal(false);
  isChatOpen = signal(false);
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
    if (this.store.status() === 'COMPLETED') {
        this.updateTime();
    } else {
        this.startTimer(); 
    }
  }
  
  ngOnDestroy() { if (this.timerInterval) clearInterval(this.timerInterval); }

  isDesktop() { return window.innerWidth >= 1024; }

  getAvatarUrl(name: string | null | undefined) {
    if (!name || name === 'guest') return 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  updateTime() {
    const start = this.store.startTime();
    if (!start) return; 
    const end = this.store.completedTime() || Date.now();
    const diff = Math.floor((end - start) / 1000);
    if (diff < 0) { this.elapsedTime.set('00:00'); return; }
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    this.elapsedTime.set(`${m}:${s}`);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
        this.updateTime();
        if (this.store.status() === 'COMPLETED') {
            clearInterval(this.timerInterval);
        }
    }, 1000);
  }

  otherPlayers() {
     const all = this.store.players() || [];
     const me = this.store.currentUserId();
     return all.filter(p => p.id !== me);
  }

  onCellClick(r: number, c: number) { this.store.selectCell(r, c); }
  onNumberInput(num: number) { this.store.makeSuggestion(num); }
  onConfirm(accepted: boolean) { this.store.confirmSuggestion(accepted); }
  
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

  getCursorsInCell(r: number, c: number) {
    const cursors = Array.from(this.store.otherCursors().values());
    return cursors.filter(cur => cur.row === r && cur.col === c);
  }
  
  reload() { this.store.resetGame(); }
  
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const num = parseInt(event.key);
    if (!isNaN(num) && num >= 1 && num <= 9) {
      if (document.activeElement?.tagName === 'INPUT') return;
      this.onNumberInput(num);
    }
  }
}