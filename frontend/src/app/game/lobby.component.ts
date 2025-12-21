import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GameStore } from '../store/game.store';
import { AuthStore } from '../auth/auth.store';
import { SocialStore } from '../store/social.store';
import { ThemeService } from '../services/theme.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#fff5f7] dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 font-sans selection:bg-blue-500/30 relative transition-colors duration-300">
      
      <!-- Navbar -->
      <nav class="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur sticky top-0 z-50 transition-colors duration-300">
        <div class="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4 md:gap-8">
            <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="xl:hidden size-9 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined">{{ isSidebarOpen() ? 'close' : 'menu' }}</span>
            </button>
            <div class="flex items-center gap-3 text-slate-900 dark:text-white">
              <div class="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px] text-white">grid_view</span>
              </div>
              <span class="font-bold text-lg tracking-tight hidden sm:block">Sudoku Co-op</span>
            </div>
            <div class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="#" class="text-blue-600 dark:text-white">Lobby</a>
              <a href="#" class="hover:text-slate-900 dark:hover:text-white transition-colors">Leaderboard</a>
            </div>
          </div>
          
          <div class="flex items-center gap-2 md:gap-4">
            <button (click)="themeService.toggleTheme()" class="size-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <div class="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2"></div>
            <div class="flex items-center gap-3" *ngIf="auth.user() as user">
              <div class="text-right hidden sm:block">
                <div class="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{{ user.username }}</div>
                <div class="text-[11px] text-slate-500 font-medium">Player</div>
              </div>
              <button (click)="showAvatarModal.set(true)" class="group relative size-9 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 transition-all">
                 <img [src]="getAvatarUrl(user.avatar)" alt="avatar" />
                 <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-white text-[16px]">edit</span>
                 </div>
              </button>
            </div>
            <button (click)="auth.logout()" class="text-sm font-bold text-rose-500 hover:text-rose-400 ml-1">Logout</button>
          </div>
        </div>
      </nav>

      <div class="flex h-[calc(100vh-64px)] max-w-[1600px] mx-auto overflow-hidden relative">
        
        <!-- Mobile Sidebar Overlay -->
        <div *ngIf="isSidebarOpen()" (click)="isSidebarOpen.set(false)" class="xl:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40"></div>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scrollbar-hide">
          
          <!-- Hero Section -->
          <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 md:p-10 mb-6 md:mb-10 shadow-sm transition-colors duration-300">
            <div class="absolute top-0 right-0 -mr-20 -mt-20 size-80 bg-blue-600/5 dark:bg-blue-600/10 blur-[100px] rounded-full"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 md:gap-12">
              <div class="max-w-xl">
                <div class="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest mb-4 border border-rose-100 dark:border-rose-500/20">Play Together</div>
                <h1 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Ready to solve?</h1>
                <p class="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                  Create a room to play with friends or jump into a public lobby to collaborate in real-time.
                </p>
              </div>

              <div class="flex flex-col gap-4 md:gap-6 w-full lg:w-[400px]">
                <!-- New Game Multi-Level Selector -->
                <div class="bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-1.5 shadow-inner">
                   <button (click)="createGame('EASY')" [disabled]="isLoading()"
                           class="flex-1 h-11 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[10px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-2">
                      <span class="material-symbols-outlined text-[16px]">child_care</span>
                      Easy
                   </button>
                   <button (click)="createGame('MEDIUM')" [disabled]="isLoading()"
                           class="flex-1 h-11 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[10px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-2">
                      <span class="material-symbols-outlined text-[16px]">star</span>
                      Medium
                   </button>
                   <button (click)="createGame('HARD')" [disabled]="isLoading()"
                           class="flex-1 h-11 px-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-[10px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-1 sm:gap-2">
                      <span class="material-symbols-outlined text-[16px]">bolt</span>
                      Hard
                   </button>
                </div>

                <!-- Room Code Input -->
                <div class="flex items-center bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 w-full h-[60px] focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-sm relative">
                  <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 ml-3">vpn_key</span>
                  <input [ngModel]="roomCodeInput()" (ngModelChange)="roomCodeInput.set($event)"
                         class="bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-0 flex-1 h-full px-3 text-base font-bold w-0" 
                         placeholder="Enter Code">
                  <button (click)="joinGame()" [disabled]="!roomCodeInput() || isLoading()"
                          class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl px-5 h-full font-black text-sm transition-colors border border-slate-200 dark:border-transparent flex items-center justify-center">
                    <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Lobbies Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
              <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Lobbies</h2>
              <div class="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-hide">
                 <button *ngFor="let f of filters"
                         (click)="selectedFilter.set(f)" 
                         class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                         [class.bg-blue-500]="selectedFilter() === f" [class.text-white]="selectedFilter() === f" [class.shadow-md]="selectedFilter() === f"
                         [class.text-slate-400]="selectedFilter() !== f">{{ f }}</button>
              </div>
            </div>
            <p class="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500">
              <span class="text-blue-500">{{ filteredLobbies().length }}</span> games found.
            </p>
          </div>

          <!-- Lobbies Table / List -->
          <div class="bg-white dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors duration-300">
            <!-- Table for Desktop -->
            <table class="w-full text-left hidden md:table">
              <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-[0.2em]">
                <tr>
                  <th class="px-8 py-6">Game Name</th>
                  <th class="px-8 py-6">Difficulty</th>
                  <th class="px-8 py-6">Players</th>
                  <th class="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr *ngFor="let game of filteredLobbies()" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div class="size-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-transparent">
                        <span class="material-symbols-outlined text-[22px]">extension</span>
                      </div>
                      <div>
                        <div class="font-black text-slate-900 dark:text-white text-base">#{{ game.roomId }}</div>
                        <div class="text-slate-400 dark:text-slate-500 text-xs font-medium">Host: {{ game.hostId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <span class="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                          [class.bg-emerald-50]="game.difficulty === 'EASY'" [class.text-emerald-600]="game.difficulty === 'EASY'" [class.border-emerald-100]="game.difficulty === 'EASY'"
                          [class.bg-blue-50]="game.difficulty === 'MEDIUM'" [class.text-blue-600]="game.difficulty === 'MEDIUM'" [class.border-blue-100]="game.difficulty === 'MEDIUM'"
                          [class.bg-rose-50]="game.difficulty === 'HARD'" [class.text-rose-600]="game.difficulty === 'HARD'" [class.border-rose-100]="game.difficulty === 'HARD'">
                        {{ game.difficulty }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-3">
                        <div class="flex -space-x-3">
                            <img [src]="getAvatarUrl('av1')" class="size-9 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-sm">
                            <div *ngIf="game.playerCount > 1" class="size-9 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-white">+1</div>
                        </div>
                        <span class="text-sm text-slate-400 dark:text-slate-500 font-bold">{{ game.playerCount }}/2</span>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-right">
                    <button *ngIf="game.playerCount < 2" (click)="joinLobby(game.roomId)" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg transition-all active:scale-95">Join</button>
                    <span *ngIf="game.playerCount >= 2" class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">FULL</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- List for Mobile -->
            <div class="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
               <div *ngFor="let game of filteredLobbies()" class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                     <div class="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[20px]">extension</span>
                     </div>
                     <div>
                        <div class="font-black text-slate-900 dark:text-white text-sm">#{{ game.roomId }}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ game.difficulty }} • {{ game.playerCount }}/2</div>
                     </div>
                  </div>
                  <button *ngIf="game.playerCount < 2" (click)="joinLobby(game.roomId)" class="px-4 py-2 bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-lg">Join</button>
               </div>
            </div>

            <div *ngIf="filteredLobbies().length === 0" class="px-8 py-20 text-center">
                <div class="flex flex-col items-center gap-4 opacity-40">
                    <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700">grid_off</span>
                    <div class="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">No lobbies found.</div>
                </div>
            </div>
          </div>
        </main>

        <!-- Sidebar (Friends) -->
        <aside class="fixed inset-y-0 left-0 w-80 border-r xl:border-l xl:border-r-0 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] z-50 flex flex-col transition-all duration-300 transform"
               [class.-translate-x-full]="!isSidebarOpen() && !isDesktop()"
               [class.translate-x-0]="isSidebarOpen() || isDesktop()"
               [class.relative]="isDesktop()"
               [class.xl:flex]="true">
          
          <div class="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
             <div class="flex items-center justify-between mb-8">
                <h3 class="font-black text-slate-900 dark:text-white tracking-tight text-xl">Social</h3>
                <button (click)="isSidebarOpen.set(false)" class="xl:hidden text-slate-400">
                   <span class="material-symbols-outlined">close</span>
                </button>
             </div>
             
             <!-- Game Invitations -->
             <div *ngFor="let inv of social.invites()" class="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/20 mb-4 shadow-sm">
                <div class="flex items-start gap-3 mb-3">
                    <img [src]="getAvatarUrl('av1')" class="size-9 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-blue-100 dark:border-transparent">
                    <div>
                        <div class="text-xs font-bold text-slate-900 dark:text-white">{{ inv.inviterName }}</div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400">invite <span class="text-blue-500 font-bold">#{{ inv.roomCode }}</span></div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button (click)="acceptInvite(inv)" class="flex-1 py-2 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Accept</button>
                    <button (click)="social.respondToInvite(inv.id, false)" class="flex-1 py-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">No</button>
                </div>
             </div>

             <!-- Friend Requests -->
             <div *ngFor="let req of social.friendRequests()" class="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/20 mb-4 shadow-sm">
                <div class="flex items-start gap-3 mb-3">
                    <img [src]="getAvatarUrl('av2')" class="size-9 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-rose-100 dark:border-transparent">
                    <div class="text-xs">
                        <div class="font-bold text-slate-900 dark:text-white">{{ req.senderName }}</div>
                        <div class="text-slate-500 text-[10px]">wants to be friends</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button (click)="social.respondToFriendRequest(req.id, true)" class="flex-1 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Confirm</button>
                    <button (click)="social.respondToFriendRequest(req.id, false)" class="flex-1 py-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">No</button>
                </div>
             </div>

             <div *ngIf="social.invites().length === 0 && social.friendRequests().length === 0" class="text-[10px] text-slate-400 dark:text-slate-500 text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-60">No pending items</div>
          </div>
          
          <div class="p-6 md:p-8 flex-1 overflow-y-auto">
             <h4 class="text-[9px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Friends ({{ social.friends().length }})</h4>
             <ul class="space-y-5">
                <li *ngFor="let friend of social.friends()" class="flex items-center gap-3 group cursor-pointer relative" (click)="toggleFriendMenu(friend.id, $event)">
                    <div class="relative shrink-0">
                        <img [src]="getAvatarUrl(friend.avatar)" class="size-10 rounded-full bg-slate-100 dark:bg-slate-800 shadow-sm">
                        <div class="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white dark:border-[#0f172a]"
                             [class.bg-emerald-500]="friend.status === 'Online'"
                             [class.bg-amber-500]="friend.status === 'In a game'"
                             [class.bg-slate-300]="friend.status === 'Offline'"></div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{{ friend.username }}</div>
                        <div class="text-[9px] font-bold uppercase tracking-wider"
                             [class.text-emerald-600]="friend.status === 'Online'"
                             [class.text-amber-600]="friend.status === 'In a game'"
                             [class.text-slate-400]="friend.status === 'Offline'">{{ friend.status }}</div>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 group-hover:text-slate-600">more_vert</span>

                    <!-- Friend Context Menu -->
                    <div *ngIf="activeFriendMenu() === friend.id" 
                         class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl z-[60] overflow-hidden py-2">
                        <button (click)="inviteUser(friend, 'MEDIUM')" class="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
                            <span class="material-symbols-outlined text-[16px]">star</span>
                            Invite to Game
                        </button>
                        <button (click)="removeFriend(friend)" class="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                            <span class="material-symbols-outlined text-[16px]">person_remove</span>
                            Remove Friend
                        </button>
                    </div>
                </li>
             </ul>
          </div>
          
          <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/10">
             <button (click)="showFindFriendsModal.set(true)" class="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                Find Friends
             </button>
          </div>
        </aside>

        <!-- Find Friends Modal -->
        <div *ngIf="showFindFriendsModal()" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
             <div class="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4 h-[550px] flex flex-col relative transition-colors">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white">Find Friends</h3>
                    <button (click)="showFindFriendsModal.set(false)" class="text-slate-400">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div class="relative mb-6">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); submitSearch()" 
                           class="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                           placeholder="Search username...">
                </div>

                <div class="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                    <div *ngFor="let user of searchResults()" class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200">
                        <div class="flex items-center gap-3">
                            <img [src]="getAvatarUrl(user.avatar)" class="size-9 rounded-full bg-white dark:bg-slate-800 shadow-sm">
                            <span class="text-xs font-black text-slate-900 dark:text-white">{{ user.username }}</span>
                        </div>
                        <button *ngIf="user.status === 'Not Friend'" (click)="sendFriendRequest(user)" class="px-4 py-1.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Add</button>
                        <span *ngIf="user.status === 'PENDING'" class="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-500/20">Pending</span>
                    </div>
                </div>
             </div>
        </div>

        <!-- Avatar Selection Modal -->
        <div *ngIf="showAvatarModal()" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full mx-4 transition-colors duration-300">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Choose Avatar</h3>
                    <button (click)="showAvatarModal.set(false)" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div class="grid grid-cols-4 gap-4 mb-8">
                    <button *ngFor="let av of avatars" (click)="changeAvatar(av)"
                            class="aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-110 active:scale-95"
                            [class.border-blue-500]="auth.user()?.avatar === av"
                            [class.border-transparent]="auth.user()?.avatar !== av">
                       <img [src]="getAvatarUrl(av)" class="w-full h-full object-cover">
                    </button>
                </div>

                <button (click)="showAvatarModal.set(false)" class="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl">
                    Close
                </button>
             </div>
        </div>

      </div>
    </div>
  `
})
export class LobbyComponent {
  public store = inject(GameStore);
  public auth = inject(AuthStore);
  public social = inject(SocialStore);
  public themeService = inject(ThemeService);
  private http = inject(HttpClient);
  
  roomCodeInput = signal('');
  isLoading = signal(false);
  showFindFriendsModal = signal(false);
  showAvatarModal = signal(false);
  isSidebarOpen = signal(false);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  activeFriendMenu = signal<string | null>(null);
  selectedFilter = signal<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

  filters = ['ALL', 'EASY', 'MEDIUM', 'HARD'] as const;
  avatars = ['av1', 'av2', 'av3', 'av4', 'av5', 'av6', 'av7', 'av8'] as const;

  filteredLobbies = computed(() => {
    const lobbies = this.store.activeLobbies();
    const filter = this.selectedFilter();
    if (filter === 'ALL') return lobbies;
    return lobbies.filter(l => l.difficulty === filter);
  });

  isDesktop() {
    return window.innerWidth >= 1280;
  }

  constructor() {
    this.store.loadLobbies();
    this.social.loadSocialData();
  }

  getAvatarUrl(name: string | null | undefined) {
    if (!name || name === 'guest') return 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  changeAvatar(avatar: string) {
    this.auth.updateAvatar(avatar);
  }

  createGame(difficulty: string) {
    const user = this.auth.user();
    if (!user) return;
    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/game/create?difficulty=${difficulty}&userId=${user.id}`, {}).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.store.initGame(session, { id: user.id, username: user.username, avatar: user.avatar });
      },
      error: () => this.isLoading.set(false)
    });
  }

  joinGame() {
    const user = this.auth.user();
    if (!user) return;
    const code = this.roomCodeInput().trim().toUpperCase();
    if (!code) return;

    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/game/${code}/join?userId=${user.id}`, {}).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.store.initGame(session, { id: user.id, username: user.username, avatar: user.avatar });
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'Failed to join game. Check the room code.');
      }
    });
  }

  joinLobby(roomCode: string) {
    this.roomCodeInput.set(roomCode);
    this.joinGame();
  }

  acceptInvite(inv: any) {
    this.social.respondToInvite(inv.id, true);
    this.roomCodeInput.set(inv.roomCode);
    this.joinGame();
  }

  submitSearch() {
    const query = this.searchQuery().trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.social.searchUsers(query).subscribe(res => {
        const me = this.auth.user()?.username;
        this.searchResults.set(res.filter(u => u.username !== me));
    });
  }

  inviteUser(user: any, difficulty: string = 'MEDIUM') {
    const currentUser = this.auth.user();
    if (!currentUser) return;

    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/game/create?difficulty=${difficulty}&userId=${currentUser.id}`, {}).subscribe({
      next: (session) => {
        this.social.sendInvite(user.username, session.roomId);
        this.isLoading.set(false);
        this.store.initGame(session, { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar });
        this.activeFriendMenu.set(null);
        alert(`Invitation sent! Moved to Room #${session.roomId}`);
      },
      error: () => {
        this.isLoading.set(false);
        alert('Failed to create game for invitation');
      }
    });
  }

  sendFriendRequest(user: any) {
    this.social.sendFriendRequest(user.username);
    this.submitSearch(); 
  }

  removeFriend(friend: any) {
    if (confirm(`Are you sure you want to remove ${friend.username} from your friends?`)) {
      this.social.removeFriend(friend.id);
      this.activeFriendMenu.set(null);
    }
  }

  toggleFriendMenu(friendId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeFriendMenu() === friendId) {
      this.activeFriendMenu.set(null);
    } else {
      this.activeFriendMenu.set(friendId);
    }
  }

  @HostListener('document:click')
  closeMenus() {
    this.activeFriendMenu.set(null);
  }
}
