import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const motivationalMessages = [
  "Keep going! You're doing great 💪",
  "I just finished my Pomodoro 🎉",
  "Focus is the key to success! 🔑",
  "Taking a quick break, be right back! ☕",
  "This study session is so productive! 📚",
  "Remember to stay hydrated! 💧",
  "You've got this! 🌟",
  "Learning something new every day! 🧠",
  "Time flies when you're focused! ⏰",
  "Great energy in this room! ⚡",
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: activeRooms, error: roomsError } = await supabase
      .from('study_rooms')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (roomsError) throw roomsError;

    let messagesPosted = 0;

    for (const room of activeRooms || []) {
      const { data: aiStudents, error: aiError } = await supabase
        .from('room_ai_students')
        .select('ai_student_id')
        .eq('room_id', room.id);

      if (aiError || !aiStudents || aiStudents.length === 0) continue;

      if (Math.random() < 0.3) {
        const randomAI = aiStudents[Math.floor(Math.random() * aiStudents.length)];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

        await supabase
          .from('chat_messages')
          .insert({
            room_id: room.id,
            user_id: randomAI.ai_student_id,
            message: randomMessage,
            is_ai: true,
          });

        messagesPosted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        messagesPosted,
        roomsChecked: activeRooms?.length || 0,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
