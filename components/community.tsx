import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: number;
  user_name: string;
  content: string;
  likes: number;
  created_at: string;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const { userName } = useUserStore();

  useEffect(() => {
    fetchPosts();
    // Set up real-time subscription
    const subscription = supabase
      .channel('community_posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'community_posts' 
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase.from('community_posts').insert([
        {
          user_name: userName,
          content: newPost.trim(),
          likes: 0,
        },
      ]);

      if (error) throw error;
      
      setNewPost('');
      toast.success('Post shared successfully');
    } catch (error) {
      toast.error('Failed to share post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: 'Shared from Productivity App',
        text: `${post.user_name}: ${post.content}`,
        url: window.location.href,
      });
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Share your daily progress, achievements, or challenges..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={posting}>
              {posting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share with Community'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {post.user_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{post.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id, post.likes)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}